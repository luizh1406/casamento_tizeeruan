import { z } from "zod";
import { query } from "@/server/db";
import { badRequest, clientKey, json, rateLimit, sameOrigin } from "@/server/http";
import { onlyDigits } from "@/lib/format";

const schema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo.").max(120),
  phone: z.string().trim().max(30),
  attending: z.boolean(),
  companionsCount: z.number().int().min(0).max(10).default(0),
  companionsNames: z.string().trim().max(400).default(""),
  notes: z.string().trim().max(600).default(""),
  website: z.string().max(200).optional(), // honeypot
  startedAt: z.number().optional(), // anti-bot: tempo mínimo de preenchimento
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Origem inválida." }, 403);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Requisição inválida.");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0] ?? "form")] = i.message;
    return badRequest("Confira os campos destacados.", fields);
  }
  const d = parsed.data;

  // Honeypot preenchido ou envio rápido demais => responde como sucesso, sem gravar (não ajuda o bot).
  const tooFast = typeof d.startedAt === "number" && Date.now() - d.startedAt < 2500;
  if (d.website || tooFast) return json({ ok: true, attending: d.attending });

  if (!(await rateLimit(`rsvp:${clientKey(req)}`, 8, 3600))) {
    return json({ error: "Muitas tentativas. Tente novamente em alguns minutos." }, 429);
  }

  const phone = onlyDigits(d.phone);
  if (phone.length < 10 || phone.length > 13) {
    return badRequest("Confira os campos destacados.", { phone: "Informe um telefone com DDD." });
  }
  const companionsCount = d.attending ? d.companionsCount : 0;
  const companionsNames = d.attending ? d.companionsNames : "";
  if (companionsCount > 0 && !companionsNames) {
    return badRequest("Confira os campos destacados.", { companionsNames: "Informe o nome dos acompanhantes." });
  }

  await query(
    `INSERT INTO rsvps (name, phone, attending, companions_count, companions_names, notes)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (phone) DO UPDATE SET name=EXCLUDED.name, attending=EXCLUDED.attending,
       companions_count=EXCLUDED.companions_count, companions_names=EXCLUDED.companions_names,
       notes=EXCLUDED.notes, updated_at=now()`,
    [d.name, phone, d.attending, companionsCount, companionsNames, d.notes],
  );
  return json({ ok: true, attending: d.attending });
}
