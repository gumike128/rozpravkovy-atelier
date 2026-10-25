# Copilot instructions for rozpravkovy-atelier

## Project overview

This repo is a Next.js 16 + TypeScript app for building a children’s story-production studio. The app is organized around a single workflow: define a project brief, generate story concepts, compose songs and screenplay, build a visual bible, create image prompts and motion guidance, and finalize a production package.

The main UI entry point is `src/app/studio.tsx`, which acts as a multi-step editor and navigation shell. The actual production pipeline logic is concentrated in `src/lib/production.ts`, where typed data models and generator functions like `generateStoryConcepts`, `generateSongPackage`, `generateScreenplay`, and `generateFinalPackage` turn a `ProjectDraft` into structured outputs. Those outputs are intentionally strongly typed and are consumed by the step components under `src/app/`.

Persistent storage is not ad hoc; the schema in `src/db/schema.ts` defines one PostgreSQL table per stage (`story_projects`, `story_concept_sets`, `story_song_sets`, `story_screenplay_sets`, etc.) and stores each stage as JSONB. The database client in `src/db/index.ts` requires `DATABASE_URL`.

## Commands

This repo uses the standard Next.js scripts in `package.json`:

- `npm run dev` — start the local Next.js app.
- `npm run build` — production build.
- `npm run lint` — run ESLint.
- `npm run typecheck` — run TypeScript checks with `tsc --noEmit`.

There is no automated test suite checked into the repository right now, so there is no single-test command to run. The repo currently contains no `*.test.*` or `*.spec.*` files.

## Architecture and data flow

- `src/app/page.tsx` renders the main `Studio` shell.
- `src/app/*.tsx` files are step-specific views (`production-steps.tsx`, `visual-bible.tsx`, `cue-sheet.tsx`, `image-prompts.tsx`, `motion.tsx`, `finalize.tsx`, etc.). These are UI panels for a single production stage rather than independent apps.
- `src/lib/production.ts` is the domain model and generator layer. If you need to change any content-generation logic, start here; it is the canonical place for story templates, timing calculations, and output structures.
- `src/db/schema.ts` contains the persistence contract. New generated stages should follow the existing pattern: a primary project row plus one stage-specific table with a `projectId` relationship and JSON payload.
- `tsconfig.json` uses the `@/*` alias; prefer that alias over relative imports inside `src`.

## Key conventions

- The app is Slovak-first. Story text, labels, titles, and example content are written in Slovak, even when the surrounding app is English/TypeScript. Preserve the locale and tone when editing content.
- Keep generation logic pure and typed. The repository patterns use explicit domain types (`ProjectDraft`, `StoryConcept`, `SongPackage`, `ScreenplayPackage`, etc.) rather than loose object literals.
- Stage outputs are treated as structured payloads, not freeform strings. If a new story step is added, mirror the existing pattern by updating the types in `src/lib/production.ts` and the corresponding Drizzle table in `src/db/schema.ts`.
- `src/app/studio.tsx` manages the workflow with booleans and selected IDs such as `selectedConceptId`, `songsSaved`, `screenplaySaved`, `bibleSaved`, and `finalSaved`. When you add or change a production step, keep those state flags and the sidebar/progression logic consistent.
- Prefer small, focused edits in the generator layer and the UI panels rather than duplicating logic across components.
- Use the repo’s existing naming conventions: `generate*` for content creation, `Saved*` types for persisted result objects, and `ProjectDraft` as the canonical input for the whole pipeline.

## Notes for future changes

- `DATABASE_URL` is mandatory for DB-related work; if a change depends on database access, make sure the environment variable is configured before running the app or schema tooling.
- The codebase currently emphasizes deterministic story generation and content packaging over a large backend API surface; do not assume a REST-heavy architecture is present unless a new route is explicitly added.
