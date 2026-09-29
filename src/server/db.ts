import { SCHEMA_SQL } from "./schema";

type Row = Record<string, unknown>;
interface Driver {
  query(sql: string, params?: unknown[]): Promise<Row[]>;
  exec(sql: string): Promise<void>;
}

const g = globalThis as unknown as { __dbPromise?: Promise<Driver> };

async function createDriver(): Promise<Driver> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const local = /localhost|127\.0\.0\.1/.test(url);
    const pool = new Pool({
      // sslmode/channel_binding saem da URL: o SSL é definido abaixo (evita o aviso do pg)
      connectionString: url.replace(/([?&])(sslmode|channel_binding)=[^&]*/g, "$1").replace("?&", "?").replace(/[?&]+$/, ""),
      ssl: local ? undefined : { rejectUnauthorized: false },
      max: 5,
    });
    return {
      query: async (sql, params) => (await pool.query(sql, params as unknown[])).rows,
      exec: async (sql) => {
        await pool.query(sql);
      },
    };
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL não configurada. Defina a conexão Postgres nas variáveis de ambiente.");
  }
  // Desenvolvimento: Postgres embutido (PGlite), persistido em ./.data
  const { PGlite } = await import("@electric-sql/pglite");
  const { mkdirSync } = await import("node:fs");
  mkdirSync("./.data", { recursive: true });
  const pg = new PGlite("./.data/pglite");
  await pg.waitReady;
  return {
    query: async (sql, params) => (await pg.query(sql, params as unknown[])).rows as Row[],
    exec: async (sql) => {
      await pg.exec(sql);
    },
  };
}

async function init(): Promise<Driver> {
  const d = await createDriver();
  await d.exec(SCHEMA_SQL);
  const seeded = await d.query("SELECT 1 FROM settings WHERE key = 'seeded'");
  if (seeded.length === 0) {
    const { SEED_GIFTS } = await import("./defaults");
    for (const [i, gft] of SEED_GIFTS.entries()) {
      await d.query(
        "INSERT INTO gifts (name, description, image_url, amount_cents, sort_order) VALUES ($1,$2,$3,$4,$5)",
        [gft.name, gft.description, gft.image, gft.amountCents, i],
      );
    }
    await d.query("INSERT INTO settings (key, value) VALUES ('seeded', 'true'::jsonb)");
  }
  return d;
}

function getDriver(): Promise<Driver> {
  if (!g.__dbPromise) {
    g.__dbPromise = init().catch((e) => {
      g.__dbPromise = undefined;
      throw e;
    });
  }
  return g.__dbPromise;
}

export async function query<T = Row>(sql: string, params: unknown[] = []): Promise<T[]> {
  const d = await getDriver();
  return (await d.query(sql, params)) as T[];
}

export async function queryOne<T = Row>(sql: string, params: unknown[] = []): Promise<T | null> {
  return (await query<T>(sql, params))[0] ?? null;
}
