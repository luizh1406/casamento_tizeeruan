import { z } from "zod";
import { randomBytes } from "node:crypto";
import { query, queryOne } from "@/server/db";
import { badRequest, clientKey, json, rateLimit, sameOrigin } from "@/server/http";
import { getSettings } from "@/server/settings";
import { buildPixPayload, newTxid, payloadToQrDataUrl } from "@/server/pix";
import { MAX_CENTS, MIN_CENTS } from "@/lib/limits";
import type { Gift } from "@/lib/types";

const schema = z.object({
  giftId: z.number().int().positive().nullable(),
  custom: z.boolean().default(false),
  amountCents: z.number().int().optional(),
  guestName: z.string().trim().max(100).default(""),
  message: z.string().trim().max(500).default(""),
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
  if (!parsed.success) return badRequest("Dados inválidos.");
  const d = parsed.data;

  if (!(await rateLimit(`order:${clientKey(req)}`, 20, 3600))) {
    return json({ error: "Muitas tentativas. Tente novamente em alguns minutos." }, 429);
  }

  const s = await getSettings();
  if (!s.pix.key.trim()) return json({ error: "Os noivos ainda não configuraram a chave Pix. Volte em breve!" }, 503);

  let gift: Gift | null = null;
  if (d.giftId !== null) {
    gift = await queryOne<Gift>("SELECT * FROM gifts WHERE id = $1 AND active = TRUE", [d.giftId]);
    if (!gift) return badRequest("Presente indisponível.");
  }

  let amountCents: number;
  if (gift && gift.amount_cents !== null && !d.custom) {
    amountCents = gift.amount_cents;
  } else {
    if (typeof d.amountCents !== "number") return badRequest("Informe um valor.", { amount: "Informe um valor." });
    if (d.amountCents < MIN_CENTS) return badRequest("Valor mínimo de R$ 5,00.", { amount: "O valor mínimo é R$ 5,00." });
    if (d.amountCents > MAX_CENTS) return badRequest("Valor acima do permitido.", { amount: "O valor máximo é R$ 50.000,00." });
    amountCents = d.amountCents;
  }

  const giftName = gift
    ? d.custom && gift.amount_cents !== null
      ? `${gift.name} (valor livre)`
      : gift.name
    : "Presente em valor livre";
  const token = randomBytes(16).toString("hex");
  const txid = newTxid();
  const payload = buildPixPayload({
    key: s.pix.key,
    receiverName: s.pix.receiverName,
    city: s.pix.city,
    amountCents,
    txid,
  });

  await query(
    `INSERT INTO gift_orders (public_token, txid, gift_id, gift_name, amount_cents, guest_name, message)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [token, txid, gift?.id ?? null, giftName, amountCents, d.guestName, d.message],
  );

  return json({ token, giftName, amountCents, payload, qr: await payloadToQrDataUrl(payload), status: "pending" });
}
