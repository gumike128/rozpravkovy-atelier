# Rozprávkový ateliér

A story-generation studio for turning a project draft into concept variants, songs, screenplay, visual bible, cue sheets, image prompts, motion direction, and final production packages.

## Stack

- Next.js 16
- React 19
- TypeScript
- PostgreSQL + Drizzle ORM
- Vercel-ready deployment setup

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and adjust values:
   ```bash
   cp .env.example .env
   ```
3. Create a PostgreSQL database and set `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rozpravkovy_atelier
   ```
4. Run database migrations or push the schema:
   ```bash
   npm run db:push
   ```
5. Start the app:
   ```bash
   npm run dev
   ```

The app is available at http://localhost:3000.

## Production deployment

This app is ready for Vercel. The recommended setup is:

1. Commit and push the application files to the GitHub branch you plan to deploy.
2. Import it into Vercel and select the root folder.
3. Set the environment variable `DATABASE_URL` in Vercel Project Settings.
4. Use a managed PostgreSQL service such as Neon or Supabase and paste the connection string.
5. Deploy; Vercel will run `npm run build` automatically.

Example environment variable:

```env
DATABASE_URL=postgresql://postgres:postgres@host:5432/rozpravkovy_atelier
```

If you want to run the production server locally:

```bash
npm run build
npm run start
```

## Quality gates

Before shipping, run:

```bash
npm run check
```

This runs lint, TypeScript checks, and the production build.
