import { clearSessionCookie } from "@/server/auth";
import { json, sameOrigin } from "@/server/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Origem inválida." }, 403);
  await clearSessionCookie();
  return json({ ok: true });
}
