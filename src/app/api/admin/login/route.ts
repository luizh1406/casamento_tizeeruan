import { z } from "zod";
import { checkCredentials, setSessionCookie } from "@/server/auth";
import { badRequest, clientKey, json, rateLimit, sameOrigin } from "@/server/http";

const schema = z.object({ email: z.string().max(200), password: z.string().max(200) });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Origem inválida." }, 403);
  if (!(await rateLimit(`login:${clientKey(req)}`, 8, 900))) {
    return json({ error: "Muitas tentativas. Aguarde alguns minutos." }, 429);
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest("Informe e-mail e senha.");
  if (!checkCredentials(parsed.data.email, parsed.data.password)) {
    return json({ error: "E-mail ou senha incorretos." }, 401);
  }
  await setSessionCookie();
  return json({ ok: true });
}
