import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsPostgresqlDb?: ReturnType<typeof drizzle>;
};

function ensureDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required at runtime for database-backed features.");
  }

  return databaseUrl;
}

function getPool() {
  const databaseUrl = ensureDatabaseUrl();

  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = new Pool({
      connectionString: databaseUrl,
    });
  }

  return globalForDb.__arenaNextJsPostgresqlPool;
}

function getDb() {
  ensureDatabaseUrl();

  if (!globalForDb.__arenaNextJsPostgresqlDb) {
    globalForDb.__arenaNextJsPostgresqlDb = drizzle(getPool());
  }

  return globalForDb.__arenaNextJsPostgresqlDb;
}

export const pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    const currentPool = getPool();
    const value = Reflect.get(currentPool, prop, receiver);
    return typeof value === "function" ? value.bind(currentPool) : value;
  },
});

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop, receiver) {
    const currentDb = getDb();
    const value = Reflect.get(currentDb, prop, receiver);
    return typeof value === "function" ? value.bind(currentDb) : value;
  },
});
