import { desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  storyConceptSets,
  storyCueSheets,
  storyFinalPackages,
  storyImagePromptSets,
  storyMotionSets,
  storyProjects,
  storyScreenplaySets,
  storySongSets,
  storyVisualBibleSets,
} from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await db
      .select()
      .from(storyProjects)
      .orderBy(desc(storyProjects.createdAt))
      .limit(20);

    if (projects.length === 0) return Response.json({ projects });

    const ids = projects.map((project) => project.id);
    const [concepts, songs, screenplays, bibles, cues, prompts, motions, finals] = await Promise.all([
      db.select({ projectId: storyConceptSets.projectId, selectedConceptId: storyConceptSets.selectedConceptId }).from(storyConceptSets).where(inArray(storyConceptSets.projectId, ids)),
      db.select({ projectId: storySongSets.projectId }).from(storySongSets).where(inArray(storySongSets.projectId, ids)),
      db.select({ projectId: storyScreenplaySets.projectId }).from(storyScreenplaySets).where(inArray(storyScreenplaySets.projectId, ids)),
      db.select({ projectId: storyVisualBibleSets.projectId }).from(storyVisualBibleSets).where(inArray(storyVisualBibleSets.projectId, ids)),
      db.select({ projectId: storyCueSheets.projectId }).from(storyCueSheets).where(inArray(storyCueSheets.projectId, ids)),
      db.select({ projectId: storyImagePromptSets.projectId }).from(storyImagePromptSets).where(inArray(storyImagePromptSets.projectId, ids)),
      db.select({ projectId: storyMotionSets.projectId }).from(storyMotionSets).where(inArray(storyMotionSets.projectId, ids)),
      db.select({ projectId: storyFinalPackages.projectId }).from(storyFinalPackages).where(inArray(storyFinalPackages.projectId, ids)),
    ]);

    const selected = new Set(concepts.filter((row) => row.selectedConceptId !== null).map((row) => row.projectId));
    const presence = [songs, screenplays, bibles, cues, prompts, motions, finals].map(
      (rows) => new Set(rows.map((row) => row.projectId)),
    );

    const withProgress = projects.map((project) => ({
      ...project,
      completedSteps:
        1 +
        (selected.has(project.id) ? 1 : 0) +
        presence.reduce((total, set) => total + (set.has(project.id) ? 1 : 0), 0),
    }));

    return Response.json({ projects: withProgress });
  } catch {
    return Response.json(
      { error: "Zoznam príbehov sa nepodarilo načítať." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
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

    const [project] = await db
      .insert(storyProjects)
      .values({ ...fields, duration, aspectRatio })
      .returning();

    return Response.json({ project }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Uloženie sa nepodarilo. Skúste to znova o chvíľu." },
      { status: 500 },
    );
  }
}
