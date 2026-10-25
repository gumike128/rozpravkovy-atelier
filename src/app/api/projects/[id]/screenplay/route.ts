import { eq } from "drizzle-orm";
import { db } from "@/db";
import { storyConceptSets, storyCueSheets, storyImagePromptSets, storyFinalPackages, storyMotionSets, storyProjects, storyScreenplaySets, storySongSets, storyVisualBibleSets } from "@/db/schema";
import {
  screenplayWordCount,
  wordBudget,
  type ScreenplayPackage,
  type ScreenplayScene,
  type VoiceProfile,
} from "@/lib/production";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isProjectId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isScene(value: unknown): value is ScreenplayScene {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    value.id.length <= 80 &&
    typeof value.act === "string" &&
    value.act.length > 0 &&
    value.act.length <= 80 &&
    typeof value.heading === "string" &&
    value.heading.length > 0 &&
    value.heading.length <= 160 &&
    Number.isInteger(value.durationSeconds) &&
    Number(value.durationSeconds) > 0 &&
    typeof value.action === "string" &&
    value.action.length <= 12000 &&
    typeof value.dialogue === "string" &&
    value.dialogue.length <= 12000 &&
    typeof value.foley === "string" &&
    value.foley.length <= 800
  );
}

function isVoiceProfile(value: unknown): value is VoiceProfile {
  return (
    isRecord(value) &&
    typeof value.speaker === "string" &&
    value.speaker.trim().length > 0 &&
    value.speaker.length <= 100 &&
    typeof value.direction === "string" &&
    value.direction.trim().length > 0 &&
    value.direction.length <= 500
  );
}

function isScreenplay(value: unknown): value is ScreenplayPackage {
  if (!isRecord(value) || !Array.isArray(value.scenes) || !Array.isArray(value.voiceProfiles)) return false;

  return (
    Number.isInteger(value.conceptId) &&
    Number(value.conceptId) >= 1 &&
    Number(value.conceptId) <= 5 &&
    value.scenes.length === 15 &&
    value.scenes.every(isScene) &&
    value.voiceProfiles.length >= 3 &&
    value.voiceProfiles.length <= 8 &&
    value.voiceProfiles.every(isVoiceProfile)
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

const [screenplaySet] = await db
      .select()
      .from(storyScreenplaySets)
      .where(eq(storyScreenplaySets.projectId, id))
      .limit(1);

    return Response.json({ screenplaySet: screenplaySet ?? null });
  } catch {
    return Response.json({ error: "Scenár sa nepodarilo načítať." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!isProjectId(id)) {
    return Response.json({ error: "Tento príbeh nemá platný záznam." }, { status: 400 });
  }

  try {
    const body: unknown = await request.json();

    if (!isRecord(body) || !isScreenplay(body.screenplay)) {
      return Response.json({ error: "Scenár nemá platnú stavbu alebo hlasový zoznam." }, { status: 400 });
    }
    const screenplay = body.screenplay as ScreenplayPackage;

    const [project] = await db
      .select({ id: storyProjects.id, duration: storyProjects.duration })
      .from(storyProjects)
      .where(eq(storyProjects.id, id))
      .limit(1);

    if (!project) {
      return Response.json({ error: "Príbeh sa nenašiel." }, { status: 404 });
    }

    const sceneSeconds = screenplay.scenes.reduce((total, scene) => total + scene.durationSeconds, 0);
    const budget = wordBudget(project.duration);
    const words = screenplayWordCount(screenplay);

    if (sceneSeconds !== project.duration * 60) {
      return Response.json(
        { error: `Súčet dĺžky scén musí byť presne ${project.duration * 60} sekúnd.` },
        { status: 400 },
      );
    }

    if (words < budget.minimum || words > budget.maximum) {
      return Response.json(
        { error: `Scenár má ${words} slov. Povolený rozsah je ${budget.minimum} až ${budget.maximum} slov.` },
        { status: 400 },
      );
    }

    const [conceptSet] = await db
      .select({ selectedConceptId: storyConceptSets.selectedConceptId })
      .from(storyConceptSets)
      .where(eq(storyConceptSets.projectId, id))
      .limit(1);
    const [songSet] = await db
      .select({ songPackage: storySongSets.songPackage })
      .from(storySongSets)
      .where(eq(storySongSets.projectId, id))
      .limit(1);

    if (
      conceptSet?.selectedConceptId !== screenplay.conceptId ||
      songSet?.songPackage.conceptId !== screenplay.conceptId
    ) {
      return Response.json(
        { error: "Scenár musí nadväzovať na vybraný námet aj uložené piesne." },
        { status: 409 },
      );
    }

    const screenplaySet = await db.transaction(async (transaction) => {
      const [saved] = await transaction
        .insert(storyScreenplaySets)
        .values({ projectId: id, screenplay })
        .onConflictDoUpdate({
          target: storyScreenplaySets.projectId,
          set: { screenplay, updatedAt: new Date() },
        })
        .returning();
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

    return Response.json({ screenplaySet });
  } catch {
    return Response.json(
      { error: "Uloženie scenára sa nepodarilo. Skúste to znova." },
      { status: 500 },
    );
  }
}
