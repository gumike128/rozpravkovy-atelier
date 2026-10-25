import type { CueSheet, FinalPackage, ImagePromptPackage, MotionPackage, ScreenplayPackage, SongPackage, StoryConcept, VisualBible } from "@/lib/production";
import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const storyProjects = pgTable("story_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 140 }).notNull(),
  audienceAge: varchar("audience_age", { length: 40 }).notNull(),
  languageRegister: text("language_register").notNull(),
  heroName: varchar("hero_name", { length: 80 }).notNull(),
  heroDescription: text("hero_description").notNull(),
  sideName: varchar("side_name", { length: 80 }).notNull(),
  sideDescription: text("side_description").notNull(),
  environment: text("environment").notNull(),
  plot: text("plot").notNull(),
  moral: text("moral").notNull(),
  duration: integer("duration").notNull(),
  aspectRatio: varchar("aspect_ratio", { length: 8 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const storyConceptSets = pgTable(
  "story_concept_sets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => storyProjects.id, { onDelete: "cascade" }),
    concepts: jsonb("concepts").$type<StoryConcept[]>().notNull(),
    selectedConceptId: integer("selected_concept_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("story_concept_sets_project_id_unique").on(table.projectId)],
);

export const storySongSets = pgTable(
  "story_song_sets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => storyProjects.id, { onDelete: "cascade" }),
    songPackage: jsonb("song_package").$type<SongPackage>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("story_song_sets_project_id_unique").on(table.projectId)],
);

export const storyScreenplaySets = pgTable(
  "story_screenplay_sets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => storyProjects.id, { onDelete: "cascade" }),
    screenplay: jsonb("screenplay").$type<ScreenplayPackage>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("story_screenplay_sets_project_id_unique").on(table.projectId)],
);

export const storyVisualBibleSets = pgTable(
  "story_visual_bible_sets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => storyProjects.id, { onDelete: "cascade" }),
    visualBible: jsonb("visual_bible").$type<VisualBible>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("story_visual_bible_sets_project_id_unique").on(table.projectId)],
);

export const storyCueSheets = pgTable(
  "story_cue_sheets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => storyProjects.id, { onDelete: "cascade" }),
    cueSheet: jsonb("cue_sheet").$type<CueSheet>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("story_cue_sheets_project_id_unique").on(table.projectId)],
);

export const storyImagePromptSets = pgTable(
  "story_image_prompt_sets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => storyProjects.id, { onDelete: "cascade" }),
    imagePrompts: jsonb("image_prompts").$type<ImagePromptPackage>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("story_image_prompt_sets_project_id_unique").on(table.projectId)],
);

export const storyMotionSets = pgTable(
  "story_motion_sets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => storyProjects.id, { onDelete: "cascade" }),
    motionPackage: jsonb("motion_package").$type<MotionPackage>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("story_motion_sets_project_id_unique").on(table.projectId)],
);

export const storyFinalPackages = pgTable(
  "story_final_packages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => storyProjects.id, { onDelete: "cascade" }),
    finalPackage: jsonb("final_package").$type<FinalPackage>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("story_final_packages_project_id_unique").on(table.projectId)],
);
