import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  storyConceptSets,
  storyCueSheets,
  storyImagePromptSets,
  storyFinalPackages,
  storyMotionSets,
  storyProjects,
  storyVisualBibleSets,
} from "@/db/schema";
import type { CueSheet, CueShot } from "@/lib/production";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isProjectId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isShot(value: unknown): value is CueShot {
  if (!isRecord(value)) return false;
  const duration = Number(value.durationSeconds);

  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    value.id.length <= 20 &&
    Number.isInteger(value.chunk) &&
    Number(value.chunk) >= 0 &&
    Number(value.chunk) <= 3 &&
    typeof value.timeIn === "string" &&
    /^\d{2}:\d{2}\.\d$/.test(value.timeIn) &&
    typeof value.timeOut === "string" &&
    /^\d{2}:\d{2}\.\d$/.test(value.timeOut) &&
    Number.isFinite(duration) &&
    duration >= 2 &&
    duration <= 4.5 &&
    Math.abs(duration * 10 - Math.round(duration * 10)) < 1e-6 &&
    typeof value.camera === "string" &&
    value.camera.length > 0 &&
    value.camera.length <= 120 &&
    typeof value.staging === "string" &&
    value.staging.length <= 600 &&
    typeof value.dialogue === "string" &&
    value.dialogue.length <= 1200 &&
    typeof value.foley === "string" &&
    value.foley.length <= 400 &&
    typeof value.ducking === "string" &&
    value.ducking.length > 0 &&
    value.ducking.length <= 200
  );
}

function isCueSheet(value: unknown): value is CueSheet {
  if (!isRecord(value) || !Array.isArray(value.shots)) return false;

  return (
    Number.isInteger(value.conceptId) &&
    Number(value.conceptId) >= 1 &&
    Number(value.conceptId) <= 5 &&
    value.shots.length >= 100 &&
    value.shots.length <= 400 &&
    value.shots.every(isShot) &&
    new Set(value.shots.map((shot) => (shot as CueShot).chunk)).size === 4
  );
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!isProjectId(id)) {
    return Response.json({ error: "Tento príbeh nemá platný záznam." }, { status: 400 });
  }

  try {
    const [project] = await db
      .select({ id: storyProjects.id })
      .from(storyProjects)
      .where(eq(storyProjects.id, id))
      .limit(1);

    if (!project) {
      return Response.json({ error: "Príbeh sa nenašiel." }, { status: 404 });
    }

const [sheet] = await db
      .select()
      .from(storyCueSheets)
      .where(eq(storyCueSheets.projectId, id))
      .limit(1);

    return Response.json({ cueSheetSet: sheet ?? null });
  } catch {
    return Response.json({ error: "Záberovú maticu sa nepodarilo načítať." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!isProjectId(id)) {
    return Response.json({ error: "Tento príbeh nemá platný záznam." }, { status: 400 });
  }

  try {
    const body: unknown = await request.json();

    if (!isRecord(body) || !isCueSheet(body.cueSheet)) {
      return Response.json(
        { error: "Matica musí obsahovať zábery 2,0 až 4,5 s vo všetkých štyroch častiach." },
        { status: 400 },
      );
    }
    const cueSheet = body.cueSheet as CueSheet;

    const [project] = await db
      .select({ id: storyProjects.id, duration: storyProjects.duration })
      .from(storyProjects)
      .where(eq(storyProjects.id, id))
      .limit(1);

    if (!project) {
      return Response.json({ error: "Príbeh sa nenašiel." }, { status: 404 });
    }

    const totalTenths = cueSheet.shots.reduce(
      (total, shot) => total + Math.round(shot.durationSeconds * 10),
      0,
    );

    if (totalTenths !== project.duration * 600) {
      return Response.json(
        { error: `Súčet záberov musí byť presne ${project.duration * 60} sekúnd.` },
        { status: 400 },
      );
    }

    const [conceptSet] = await db
      .select({ selectedConceptId: storyConceptSets.selectedConceptId })
      .from(storyConceptSets)
      .where(eq(storyConceptSets.projectId, id))
      .limit(1);
    const [bibleSet] = await db
      .select({ visualBible: storyVisualBibleSets.visualBible })
      .from(storyVisualBibleSets)
      .where(eq(storyVisualBibleSets.projectId, id))
      .limit(1);

    if (
      conceptSet?.selectedConceptId !== cueSheet.conceptId ||
      bibleSet?.visualBible.conceptId !== cueSheet.conceptId
    ) {
      return Response.json(
        { error: "Matica musí nadväzovať na uloženú vizuálnu knihu vybraného príbehu." },
        { status: 409 },
      );
    }

    const sheet = await db.transaction(async (transaction) => {
      const [saved] = await transaction
        .insert(storyCueSheets)
        .values({ projectId: id, cueSheet })
        .onConflictDoUpdate({
          target: storyCueSheets.projectId,
          set: { cueSheet, updatedAt: new Date() },
        })
        .returning();
      await transaction
        .delete(storyImagePromptSets)
        .where(eq(storyImagePromptSets.projectId, id));
      await transaction
        .delete(storyMotionSets)
        .where(eq(storyMotionSets.projectId, id));
      await transaction
        .delete(storyFinalPackages)
        .where(eq(storyFinalPackages.projectId, id));
      return saved;
    });

    return Response.json({ cueSheetSet: sheet });
  } catch {
    return Response.json(
      { error: "Uloženie matice sa nepodarilo. Skúste to znova." },
      { status: 500 },
    );
  }
}
