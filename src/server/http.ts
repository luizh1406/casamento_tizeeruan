import { NextResponse } from "next/server";
import { isAdmin } from "./auth";
import { createHash } from "node:crypto";
import { query } from "./db";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
export const badRequest = (message: string, fields?: Record<string, string>) => json({ error: message, fields }, 400);

/** Retorna uma Response 401 se não for admin; null se autorizado. */
export async function guardAdmin() {
  if (!(await isAdmin())) return json({ error: "Não autorizado." }, 401);
  return null;
}

/** Bloqueia requisições de outra origem em rotas que alteram estado (defesa extra contra CSRF). */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function clientKey(req: Request): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 24);
}

/** Limite por janela fixa, persistido no banco (funciona em ambiente serverless). */
export async function rateLimit(key: string, max: number, windowSec: number): Promise<boolean> {
  const rows = await query<{ count: number }>(
    `INSERT INTO rate_limits (key, count, window_start) VALUES ($1, 1, now())
     ON CONFLICT (key) DO UPDATE SET
       count = CASE WHEN rate_limits.window_start < now() - ($2 || ' seconds')::interval THEN 1 ELSE rate_limits.count + 1 END,
       window_start = CASE WHEN rate_limits.window_start < now() - ($2 || ' seconds')::interval THEN now() ELSE rate_limits.window_start END
     RETURNING count`,
    [key, String(windowSec)],
  );
  return (rows[0]?.count ?? 1) <= max;
}
