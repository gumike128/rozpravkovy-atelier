import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  storyConceptSets,
  storyFinalPackages,
  storyImagePromptSets,
  storyMotionSets,
  storyProjects,
} from "@/db/schema";
import { motionProfiles, type MotionEntry, type MotionPackage } from "@/lib/production";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isProjectId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isEntry(value: unknown): value is MotionEntry {
  if (!isRecord(value)) return false;
  const profile = value.profile;
  if (profile !== "A" && profile !== "B" && profile !== "C") return false;
  const meta = motionProfiles[profile];
  const duration = Number(value.durationSeconds);

  return (
    typeof value.shotId === "string" &&
    value.shotId.length > 0 &&
    value.shotId.length <= 20 &&
    Number.isInteger(value.chunk) &&
    Number(value.chunk) >= 0 &&
    Number(value.chunk) <= 3 &&
    Number.isFinite(duration) &&
    duration >= meta.min &&
    duration <= meta.max &&
    typeof value.camera === "string" &&
    value.camera.length > 0 &&
    value.camera.length <= 120 &&
    typeof value.timeRange === "string" &&
    value.timeRange.length > 0 &&
    value.timeRange.length <= 40 &&
    typeof value.motionPrompt === "string" &&
    value.motionPrompt.includes(`TYPE ${profile}`) &&
    value.motionPrompt.length > 0 &&
    value.motionPrompt.length <= 4000
  );
}

function isPackage(value: unknown): value is MotionPackage {
  if (!isRecord(value) || !Array.isArray(value.entries)) return false;

  return (
    Number.isInteger(value.conceptId) &&
    Number(value.conceptId) >= 1 &&
    Number(value.conceptId) <= 5 &&
    value.entries.length >= 100 &&
    value.entries.length <= 400 &&
    value.entries.every(isEntry) &&
    new Set(value.entries.map((entry) => (entry as MotionEntry).chunk)).size === 4
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

const [set] = await db
      .select()
      .from(storyMotionSets)
      .where(eq(storyMotionSets.projectId, id))
      .limit(1);

    return Response.json({ motionSet: set ?? null });
  } catch {
    return Response.json({ error: "Pohybové predpisy sa nepodarilo načítať." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!isProjectId(id)) {
    return Response.json({ error: "Tento príbeh nemá platný záznam." }, { status: 400 });
  }

  try {
    const body: unknown = await request.json();

    if (!isRecord(body) || !isPackage(body.motionPackage)) {
      return Response.json(
        { error: "Každý záber musí mať profil A, B alebo C v povolenom rozsahu trvania." },
        { status: 400 },
      );
    }
    const motionPackage = body.motionPackage as MotionPackage;

    const [project] = await db
      .select({ id: storyProjects.id })
      .from(storyProjects)
      .where(eq(storyProjects.id, id))
      .limit(1);

    if (!project) {
      return Response.json({ error: "Príbeh sa nenašiel." }, { status: 404 });
    }

    const [conceptSet] = await db
      .select({ selectedConceptId: storyConceptSets.selectedConceptId })
      .from(storyConceptSets)
      .where(eq(storyConceptSets.projectId, id))
      .limit(1);
    const [promptSet] = await db
      .select({ imagePrompts: storyImagePromptSets.imagePrompts })
      .from(storyImagePromptSets)
      .where(eq(storyImagePromptSets.projectId, id))
      .limit(1);

    if (
      conceptSet?.selectedConceptId !== motionPackage.conceptId ||
      promptSet?.imagePrompts.conceptId !== motionPackage.conceptId ||
      promptSet?.imagePrompts.prompts.length !== motionPackage.entries.length
    ) {
      return Response.json(
        { error: "Pohybové predpisy musia zodpovedať uloženým obrazovým pokynom." },
        { status: 409 },
      );
    }

    const set = await db.transaction(async (transaction) => {
      const [saved] = await transaction
        .insert(storyMotionSets)
        .values({ projectId: id, motionPackage })
        .onConflictDoUpdate({
          target: storyMotionSets.projectId,
          set: { motionPackage, updatedAt: new Date() },
        })
        .returning();
      await transaction
        .delete(storyFinalPackages)
        .where(eq(storyFinalPackages.projectId, id));
      return saved;
    });

    return Response.json({ motionSet: set });
  } catch {
    return Response.json(
      { error: "Uloženie pohybových predpisov sa nepodarilo. Skúste to znova." },
      { status: 500 },
    );
  }
}
