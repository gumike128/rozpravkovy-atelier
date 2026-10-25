import { eq } from "drizzle-orm";
import { db } from "@/db";
import { storyConceptSets, storyCueSheets, storyImagePromptSets, storyFinalPackages, storyMotionSets, storyProjects, storyScreenplaySets, storySongSets, storyVisualBibleSets } from "@/db/schema";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function isProjectId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!isProjectId(id)) {
    return Response.json({ error: "Tento príbeh nemá platný záznam." }, { status: 400 });
  }

  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ error: "Údaje príbehu nie sú platné." }, { status: 400 });
    }

    const values = body as Record<string, unknown>;
    const text = (key: string) =>
      typeof values[key] === "string" ? (values[key] as string).trim() : "";
    const fields = {
      title: text("title"),
      audienceAge: text("audienceAge"),
      languageRegister: text("languageRegister"),
      heroName: text("heroName"),
      heroDescription: text("heroDescription"),
      sideName: text("sideName"),
      sideDescription: text("sideDescription"),
      environment: text("environment"),
      plot: text("plot"),
      moral: text("moral"),
    };
    const duration = Number(values.duration);
    const aspectRatio = values.aspectRatio;

    if (Object.values(fields).some((value) => !value)) {
      return Response.json(
        { error: "Vyplňte všetky polia produkčného pasu." },
        { status: 400 },
      );
    }

    if (
      fields.title.length > 140 ||
      fields.heroName.length > 80 ||
      fields.sideName.length > 80 ||
      ![8, 9, 10].includes(duration) ||
      (aspectRatio !== "16:9" && aspectRatio !== "9:16")
    ) {
      return Response.json(
        { error: "Niektorý technický parameter nie je platný." },
        { status: 400 },
      );
    }

    const project = await db.transaction(async (transaction) => {
      const [updated] = await transaction
        .update(storyProjects)
        .set({ ...fields, duration, aspectRatio })
        .where(eq(storyProjects.id, id))
        .returning();

      if (updated) {
        await transaction
          .delete(storyConceptSets)
          .where(eq(storyConceptSets.projectId, id));
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

      return updated;
    });

    if (!project) {
      return Response.json({ error: "Príbeh sa nenašiel." }, { status: 404 });
    }

    return Response.json({ project });
  } catch {
    return Response.json(
      { error: "Zmeny sa nepodarilo uložiť. Skúste to znova o chvíľu." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!isProjectId(id)) {
    return Response.json({ error: "Tento príbeh nemá platný záznam." }, { status: 400 });
  }

  try {
    const [deleted] = await db
      .delete(storyProjects)
      .where(eq(storyProjects.id, id))
      .returning({ id: storyProjects.id });

    if (!deleted) {
      return Response.json({ error: "Príbeh sa nenašiel." }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "Zmazanie sa nepodarilo. Skúste to znova o chvíľu." },
      { status: 500 },
    );
  }
}
