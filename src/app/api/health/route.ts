import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return Response.json(
      {
        ok: false,
        dbReady: false,
        message: "DATABASE_URL is not configured. Database-backed features are unavailable.",
      },
      { status: 503 },
    );
  }

  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, dbReady: true });
  } catch {
    return Response.json(
      { ok: false, dbReady: false, message: "Database connection check failed." },
      { status: 500 },
    );
  }
}
