import { query } from "./db";
import { DEFAULT_SETTINGS } from "./defaults";
import type { Settings } from "@/lib/types";

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
/** Mescla profundamente objetos; arrays e escalares do usuário substituem os padrões. */
function merge<T>(base: T, over: unknown): T {
  if (!isObj(base) || !isObj(over)) return (over === undefined || over === null ? base : (over as T));
  const out: Record<string, unknown> = { ...base };
  for (const k of Object.keys(over)) out[k] = merge((base as Record<string, unknown>)[k], over[k]);
  return out as T;
}

export async function getSettings(): Promise<Settings> {
  const rows = await query<{ value: unknown }>("SELECT value FROM settings WHERE key = 'site'");
  return merge(DEFAULT_SETTINGS, rows[0]?.value);
}

export async function saveSettings(s: Settings): Promise<void> {
  await query(
    "INSERT INTO settings (key, value) VALUES ('site', $1::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
    [JSON.stringify(s)],
  );
}
