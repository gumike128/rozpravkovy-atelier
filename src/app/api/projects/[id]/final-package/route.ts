import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  storyConceptSets,
  storyFinalPackages,
  storyMotionSets,
  storyProjects,
} from "@/db/schema";
import type { FinalPackage } from "@/lib/production";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isProjectId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isFinalPackage(value: unknown): value is FinalPackage {
  if (!isRecord(value)) return false;
  const text = (key: string, max: number) =>
    typeof value[key] === "string" && (value[key] as string).trim().length > 0 && (value[key] as string).length <= max;

  return (
    Number.isInteger(value.conceptId) &&
    Number(value.conceptId) >= 1 &&
    Number(value.conceptId) <= 5 &&
    text("thematicUnderscore", 2000) &&
    text("tensionCue", 2000) &&
    text("thumbnailWonder", 8000) &&
    text("thumbnailSlapstick", 8000) &&
    (value.thematicUnderscore as string).includes("no vocals") &&
    (value.tensionCue as string).includes("no vocals") &&
    (value.thumbnailWonder as string).includes("[CHAR_HERO]") &&
    (value.thumbnailSlapstick as string).includes("[CHAR_HERO]")
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
      .from(storyFinalPackages)
      .where(eq(storyFinalPackages.projectId, id))
      .limit(1);

    return Response.json({ finalSet: set ?? null });
  } catch {
    return Response.json({ error: "Záverečný balík sa nepodarilo načítať." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!isProjectId(id)) {
    return Response.json({ error: "Tento príbeh nemá platný záznam." }, { status: 400 });
  }

  try {
    const body: unknown = await request.json();

    if (!isRecord(body) || !isFinalPackage(body.finalPackage)) {
      return Response.json(
        { error: "Balík potrebuje dva hudobné podklady a dve miniatúry s tokenmi." },
        { status: 400 },
      );
    }
    const finalPackage = body.finalPackage as FinalPackage;

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
    const [motionSet] = await db
      .select({ motionPackage: storyMotionSets.motionPackage })
      .from(storyMotionSets)
      .where(eq(storyMotionSets.projectId, id))
      .limit(1);

    if (
      conceptSet?.selectedConceptId !== finalPackage.conceptId ||
      motionSet?.motionPackage.conceptId !== finalPackage.conceptId
    ) {
      return Response.json(
        { error: "Balík musí nadväzovať na uložené pohybové predpisy vybraného príbehu." },
        { status: 409 },
      );
    }

    const [set] = await db
      .insert(storyFinalPackages)
      .values({ projectId: id, finalPackage })
      .onConflictDoUpdate({
        target: storyFinalPackages.projectId,
        set: { finalPackage, updatedAt: new Date() },
      })
      .returning();

    return Response.json({ finalSet: set });
  } catch {
    return Response.json(
      { error: "Uloženie balíka sa nepodarilo. Skúste to znova." },
      { status: 500 },
    );
  }
}
