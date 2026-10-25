import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  storyConceptSets,
  storyCueSheets,
  storyImagePromptSets,
  storyFinalPackages,
  storyMotionSets,
  storyProjects,
  storyScreenplaySets,
  storyVisualBibleSets,
} from "@/db/schema";
import type { ColorAct, VisualAnchorEntry, VisualBible } from "@/lib/production";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isProjectId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isAnchor(value: unknown): value is VisualAnchorEntry {
  return (
    isRecord(value) &&
    typeof value.token === "string" &&
    ["[CHAR_HERO]", "[CHAR_SIDE]", "[ENV_WORLD]"].includes(value.token) &&
    typeof value.label === "string" &&
    value.label.trim().length > 0 &&
    value.label.length <= 140 &&
    typeof value.definition === "string" &&
    value.definition.trim().length > 0 &&
    value.definition.length <= 2000
  );
}

function isColorAct(value: unknown): value is ColorAct {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    value.id.length <= 40 &&
    typeof value.title === "string" &&
    value.title.length > 0 &&
    value.title.length <= 120 &&
    typeof value.timeRange === "string" &&
    value.timeRange.length > 0 &&
    value.timeRange.length <= 40 &&
    Array.isArray(value.palette) &&
    value.palette.length === 4 &&
    value.palette.every((color) => typeof color === "string" && /^#[0-9a-fA-F]{6}$/.test(color)) &&
    typeof value.lighting === "string" &&
    value.lighting.trim().length > 0 &&
    value.lighting.length <= 600 &&
    typeof value.emotion === "string" &&
    value.emotion.trim().length > 0 &&
    value.emotion.length <= 300
  );
}

export function describeVisualBibleProblem(value: unknown): string | null {
  if (!isRecord(value)) return "Vizuálna kniha má neplatný tvar.";
  if (!Array.isArray(value.anchors) || value.anchors.length !== 3) {
    return "Vizuálna kniha musí mať presne tri tokeny: [CHAR_HERO], [CHAR_SIDE] a [ENV_WORLD].";
  }
  for (const anchor of value.anchors) {
    if (!isRecord(anchor) || typeof anchor.token !== "string") return "Token má neplatný tvar.";
    const token = anchor.token;
    if (typeof anchor.definition !== "string" || anchor.definition.trim().length === 0) {
      return `Definícia ${token} nesmie zostať prázdna.`;
    }
    if (anchor.definition.length > 2000) {
      return `Definícia ${token} má ${anchor.definition.length} znakov, povolených je najviac 2000.`;
    }
    if (typeof anchor.label !== "string" || anchor.label.trim().length === 0 || anchor.label.length > 140) {
      return `Názov pri ${token} musí mať 1 až 140 znakov.`;
    }
  }
  if (!Array.isArray(value.acts) || value.acts.length !== 4) {
    return "Farebný scenár musí mať presne štyri akty.";
  }
  for (const act of value.acts) {
    if (!isRecord(act)) return "Akt má neplatný tvar.";
    const title = typeof act.title === "string" ? act.title : "akt";
    if (typeof act.lighting !== "string" || act.lighting.trim().length === 0) return `Svetlo a atmosféra pre „${title}“ nesmie zostať prázdne.`;
    if (act.lighting.length > 600) return `Svetlo a atmosféra pre „${title}“ má viac ako 600 znakov.`;
    if (typeof act.emotion !== "string" || act.emotion.trim().length === 0) return `Emocionálny oblúk pre „${title}“ nesmie zostať prázdny.`;
    if (act.emotion.length > 300) return `Emocionálny oblúk pre „${title}“ má viac ako 300 znakov.`;
    if (!Array.isArray(act.palette) || act.palette.length !== 4 || !act.palette.every((color) => typeof color === "string" && /^#[0-9a-fA-F]{6}$/.test(color))) {
      return `Paleta pre „${title}“ musí mať štyri farby vo formáte #RRGGBB.`;
    }
  }
  if (typeof value.referenceSettings !== "string" || value.referenceSettings.trim().length === 0 || value.referenceSettings.length > 200) {
    return "Referenčné nastavenie musí mať 1 až 200 znakov.";
  }
  return null;
}

function isVisualBible(value: unknown): value is VisualBible {
  if (!isRecord(value) || !Array.isArray(value.anchors) || !Array.isArray(value.acts)) return false;

  return (
    Number.isInteger(value.conceptId) &&
    Number(value.conceptId) >= 1 &&
    Number(value.conceptId) <= 5 &&
    value.anchors.length === 3 &&
    value.anchors.every(isAnchor) &&
    new Set(value.anchors.map((anchor) => (anchor as VisualAnchorEntry).token)).size === 3 &&
    typeof value.referenceSettings === "string" &&
    value.referenceSettings.trim().length > 0 &&
    value.referenceSettings.length <= 200 &&
    value.acts.length === 4 &&
    value.acts.every(isColorAct)
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

const [bibleSet] = await db
      .select()
      .from(storyVisualBibleSets)
      .where(eq(storyVisualBibleSets.projectId, id))
      .limit(1);

    return Response.json({ bibleSet: bibleSet ?? null });
  } catch {
    return Response.json({ error: "Vizuálnu knihu sa nepodarilo načítať." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!isProjectId(id)) {
    return Response.json({ error: "Tento príbeh nemá platný záznam." }, { status: 400 });
  }

  try {
    const body: unknown = await request.json();

    if (!isRecord(body) || !isVisualBible(body.visualBible)) {
      const reason = isRecord(body) ? describeVisualBibleProblem(body.visualBible) : null;
      return Response.json(
        { error: reason ?? "Vizuálna kniha potrebuje tri tokeny a štyri farebné akty." },
        { status: 400 },
      );
    }
    const visualBible = body.visualBible as VisualBible;

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
    const [screenplaySet] = await db
      .select({ conceptId: storyScreenplaySets.screenplay })
      .from(storyScreenplaySets)
      .where(eq(storyScreenplaySets.projectId, id))
      .limit(1);

    if (
      conceptSet?.selectedConceptId !== visualBible.conceptId ||
      screenplaySet?.conceptId.conceptId !== visualBible.conceptId
    ) {
      return Response.json(
        { error: "Vizuálna kniha musí nadväzovať na uložený scenár vybraného príbehu." },
        { status: 409 },
      );
    }

    const bibleSet = await db.transaction(async (transaction) => {
      const [saved] = await transaction
        .insert(storyVisualBibleSets)
        .values({ projectId: id, visualBible })
        .onConflictDoUpdate({
          target: storyVisualBibleSets.projectId,
          set: { visualBible, updatedAt: new Date() },
        })
        .returning();
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

    return Response.json({ bibleSet });
  } catch {
    return Response.json(
      { error: "Uloženie vizuálnej knihy sa nepodarilo. Skúste to znova." },
      { status: 500 },
    );
  }
}
