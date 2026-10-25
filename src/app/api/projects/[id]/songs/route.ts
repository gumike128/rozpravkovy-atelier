import { eq } from "drizzle-orm";
import { db } from "@/db";
import { storyConceptSets, storyCueSheets, storyImagePromptSets, storyFinalPackages, storyMotionSets, storyProjects, storyScreenplaySets, storySongSets, storyVisualBibleSets } from "@/db/schema";
import type { SongPackage, SongTrack } from "@/lib/production";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isProjectId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isSongTrack(value: unknown): value is SongTrack {
  if (!isRecord(value) || !Array.isArray(value.lyrics)) return false;

  return (
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    value.title.length <= 100 &&
    typeof value.stylePrompt === "string" &&
    value.stylePrompt.trim().length > 0 &&
    value.stylePrompt.length <= 1200 &&
    value.lyrics.length === 8 &&
    value.lyrics.every((line) => typeof line === "string" && line.trim().length > 0 && line.length <= 180)
  );
}

function isSongPackage(value: unknown): value is SongPackage {
  if (!isRecord(value)) return false;

  return (
    Number.isInteger(value.conceptId) &&
    Number(value.conceptId) >= 1 &&
    Number(value.conceptId) <= 5 &&
    isSongTrack(value.opening) &&
    isSongTrack(value.closing)
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

const [songSet] = await db
      .select()
      .from(storySongSets)
      .where(eq(storySongSets.projectId, id))
      .limit(1);

    return Response.json({ songSet: songSet ?? null });
  } catch {
    return Response.json({ error: "Skladby sa nepodarilo načítať." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!isProjectId(id)) {
    return Response.json({ error: "Tento príbeh nemá platný záznam." }, { status: 400 });
  }

  try {
    const body: unknown = await request.json();

    if (!isRecord(body) || !isSongPackage(body.songPackage)) {
      return Response.json(
        { error: "Každá skladba musí mať názov, hudobný opis a presne osem veršov." },
        { status: 400 },
      );
    }
    const songPackage = body.songPackage as SongPackage;

    const [project] = await db
      .select({ id: storyProjects.id })
      .from(storyProjects)
      .where(eq(storyProjects.id, id))
      .limit(1);

    if (!project) {
      return Response.json({ error: "Príbeh sa nenašiel." }, { status: 404 });
    }

    const [selectedSet] = await db
      .select({ selectedConceptId: storyConceptSets.selectedConceptId })
      .from(storyConceptSets)
      .where(eq(storyConceptSets.projectId, id))
      .limit(1);

    if (selectedSet?.selectedConceptId !== songPackage.conceptId) {
      return Response.json(
        { error: "Skladby musia nadväzovať na vybranú príbehovú os." },
        { status: 409 },
      );
    }

    const songSet = await db.transaction(async (transaction) => {
      const [saved] = await transaction
        .insert(storySongSets)
        .values({ projectId: id, songPackage })
        .onConflictDoUpdate({
          target: storySongSets.projectId,
          set: { songPackage, updatedAt: new Date() },
        })
        .returning();

      await transaction
        .delete(storyScreenplaySets)
        .where(eq(storyScreenplaySets.projectId, id));
      await transaction
        .delete(storyVisualBibleSets)
        .where(eq(storyVisualBibleSets.projectId, id));
      await transaction
        .delete(storyCueSheets)
        .where(eq(storyCueSheets.projectId, id));
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

    return Response.json({ songSet });
  } catch {
    return Response.json(
      { error: "Uloženie skladieb sa nepodarilo. Skúste to znova." },
      { status: 500 },
    );
  }
}
