import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  storyConceptSets,
  storyCueSheets,
  storyImagePromptSets,
  storyFinalPackages,
  storyMotionSets,
  storyProjects,
} from "@/db/schema";
import type { ImagePromptEntry, ImagePromptPackage } from "@/lib/production";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isProjectId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isPrompt(value: unknown): value is ImagePromptEntry {
  return (
    isRecord(value) &&
    typeof value.shotId === "string" &&
    value.shotId.length > 0 &&
    value.shotId.length <= 20 &&
    Number.isInteger(value.chunk) &&
    Number(value.chunk) >= 0 &&
    Number(value.chunk) <= 3 &&
    typeof value.actLabel === "string" &&
    value.actLabel.length > 0 &&
    value.actLabel.length <= 120 &&
    typeof value.timeRange === "string" &&
    value.timeRange.length > 0 &&
    value.timeRange.length <= 40 &&
    typeof value.prompt === "string" &&
    value.prompt.includes("[CHAR_HERO]") &&
    value.prompt.includes("[CHAR_SIDE]") &&
    value.prompt.includes("[ENV_WORLD]") &&
    value.prompt.includes("--ar ") &&
    value.prompt.includes("--stylize 250") &&
    value.prompt.length <= 8000 &&
    typeof value.negative === "string" &&
    value.negative.startsWith("negative:") &&
    value.negative.length <= 800
  );
}

function isPackage(value: unknown): value is ImagePromptPackage {
  if (!isRecord(value) || !Array.isArray(value.prompts)) return false;

  return (
    Number.isInteger(value.conceptId) &&
    Number(value.conceptId) >= 1 &&
    Number(value.conceptId) <= 5 &&
    value.prompts.length >= 100 &&
    value.prompts.length <= 400 &&
    value.prompts.every(isPrompt) &&
    new Set(value.prompts.map((entry) => (entry as ImagePromptEntry).chunk)).size === 4
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
      .from(storyImagePromptSets)
      .where(eq(storyImagePromptSets.projectId, id))
      .limit(1);

    return Response.json({ promptSet: set ?? null });
  } catch {
    return Response.json({ error: "Obrazové pokyny sa nepodarilo načítať." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!isProjectId(id)) {
    return Response.json({ error: "Tento príbeh nemá platný záznam." }, { status: 400 });
  }

  try {
    const body: unknown = await request.json();

    if (!isRecord(body) || !isPackage(body.imagePrompts)) {
      return Response.json(
        { error: "Každý pokyn musí obsahovať tri tokeny, štýlový blok a technické flagy." },
        { status: 400 },
      );
    }
    const imagePrompts = body.imagePrompts as ImagePromptPackage;

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
    const [cueSet] = await db
      .select({ cueSheet: storyCueSheets.cueSheet })
      .from(storyCueSheets)
      .where(eq(storyCueSheets.projectId, id))
      .limit(1);

    if (
      conceptSet?.selectedConceptId !== imagePrompts.conceptId ||
      cueSet?.cueSheet.conceptId !== imagePrompts.conceptId ||
      cueSet?.cueSheet.shots.length !== imagePrompts.prompts.length
    ) {
      return Response.json(
        { error: "Pokyny musia presne zodpovedať záberom uloženej matice." },
        { status: 409 },
      );
    }

    const set = await db.transaction(async (transaction) => {
      const [saved] = await transaction
        .insert(storyImagePromptSets)
        .values({ projectId: id, imagePrompts })
        .onConflictDoUpdate({
          target: storyImagePromptSets.projectId,
          set: { imagePrompts, updatedAt: new Date() },
        })
        .returning();
      await transaction
        .delete(storyMotionSets)
        .where(eq(storyMotionSets.projectId, id));
      await transaction
        .delete(storyFinalPackages)
        .where(eq(storyFinalPackages.projectId, id));
      return saved;
    });

    return Response.json({ promptSet: set });
  } catch {
    return Response.json(
      { error: "Uloženie pokynov sa nepodarilo. Skúste to znova." },
      { status: 500 },
    );
  }
}
