import { eq } from "drizzle-orm";
import { db } from "@/db";
import { storyConceptSets, storyCueSheets, storyImagePromptSets, storyFinalPackages, storyMotionSets, storyProjects, storyScreenplaySets, storySongSets, storyVisualBibleSets } from "@/db/schema";
import type { StoryConcept } from "@/lib/production";

export const dynamic = "force-dynamic";

const storyBeatLabels = new Set([
  "Kde bolo, tam bolo...",
  "Každý deň...",
  "Až jedného dňa...",
  "A preto...",
  "Až nakoniec...",
  "A odvtedy...",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isStoryConcept(value: unknown): value is StoryConcept {
  if (!isRecord(value) || !Array.isArray(value.beats)) return false;
  const beats = value.beats;

  return (
    Number.isInteger(value.id) &&
    Number(value.id) >= 1 &&
    Number(value.id) <= 5 &&
    typeof value.title === "string" &&
    typeof value.hook === "string" &&
    typeof value.externalWant === "string" &&
    typeof value.internalNeed === "string" &&
    typeof value.tone === "string" &&
    beats.length === 7 &&
    beats.every(
      (beat) =>
        isRecord(beat) &&
        typeof beat.label === "string" &&
        storyBeatLabels.has(beat.label) &&
        typeof beat.text === "string",
    )
  );
}

function isProjectId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
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

    const [conceptSet] = await db
      .select()
      .from(storyConceptSets)
      .where(eq(storyConceptSets.projectId, id))
      .limit(1);

    return Response.json({ conceptSet: conceptSet ?? null });
  } catch {
    return Response.json(
      { error: "Námety sa nepodarilo načítať." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!isProjectId(id)) {
    return Response.json({ error: "Tento príbeh nemá platný záznam." }, { status: 400 });
  }

  try {
    const body: unknown = await request.json();

    if (!isRecord(body) || !Array.isArray(body.concepts) || body.concepts.length !== 5) {
      return Response.json(
        { error: "Pre uloženie treba presne päť príbehových námetov." },
        { status: 400 },
      );
    }

    if (!body.concepts.every(isStoryConcept)) {
      return Response.json(
        { error: "Jeden z príbehových námetov nemá platnú stavbu." },
        { status: 400 },
      );
    }

    const concepts = body.concepts as StoryConcept[];
    const conceptIds = new Set(concepts.map((concept) => concept.id));
    const selectedValue = body.selectedConceptId;
    const selectedConceptId = selectedValue === null ? null : Number(selectedValue);

    if (
      conceptIds.size !== 5 ||
      (selectedConceptId !== null && !conceptIds.has(selectedConceptId))
    ) {
      return Response.json(
        { error: "Zvolený námet sa v zozname nenašiel." },
        { status: 400 },
      );
    }

    const [project] = await db
      .select({ id: storyProjects.id })
      .from(storyProjects)
      .where(eq(storyProjects.id, id))
      .limit(1);

    if (!project) {
      return Response.json({ error: "Príbeh sa nenašiel." }, { status: 404 });
    }

    const conceptSet = await db.transaction(async (transaction) => {
      const [current] = await transaction
        .select({ selectedConceptId: storyConceptSets.selectedConceptId })
        .from(storyConceptSets)
        .where(eq(storyConceptSets.projectId, id))
        .limit(1);
      const [saved] = await transaction
        .insert(storyConceptSets)
        .values({ projectId: id, concepts, selectedConceptId })
        .onConflictDoUpdate({
          target: storyConceptSets.projectId,
          set: { concepts, selectedConceptId, updatedAt: new Date() },
        })
        .returning();

      if (current?.selectedConceptId !== selectedConceptId) {
        await transaction
          .delete(storySongSets)
          .where(eq(storySongSets.projectId, id));
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
      }

      return saved;
    });

    return Response.json({ conceptSet }, { status: 200 });
  } catch {
    return Response.json(
      { error: "Uloženie námetov sa nepodarilo. Skúste to znova." },
      { status: 500 },
    );
  }
}
