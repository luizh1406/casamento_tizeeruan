import { createHash, timingSafeEqual } from "node:crypto";
import { query } from "@/server/db";
import { json } from "@/server/http";

/**
 * Webhook no formato da API Pix do Banco Central (Efí, Sicoob, Bradesco, Itaú etc.):
 *   { "pix": [ { "endToEndId": "...", "txid": "...", "valor": "80.00" } ] }
 * Habilitado apenas se PIX_WEBHOOK_SECRET estiver definido. Envie o segredo no header `x-webhook-secret`
 * (ou como ?secret= na URL cadastrada no PSP). A confirmação só ocorre se o txid existir e o valor cobrir o pedido.
 * Só funciona quando a cobrança é criada na API do PSP com o mesmo txid.
 */
function eq(a: string, b: string) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

export async function POST(req: Request) {
  const secret = process.env.PIX_WEBHOOK_SECRET;
  if (!secret) return json({ error: "Webhook desabilitado." }, 404);
  const provided = req.headers.get("x-webhook-secret") ?? new URL(req.url).searchParams.get("secret") ?? "";
  if (!eq(provided, secret)) return json({ error: "Não autorizado." }, 401);

  let body: { pix?: { endToEndId?: string; txid?: string; valor?: string | number }[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido." }, 400);
  }

  let confirmed = 0;
  for (const p of body.pix ?? []) {
    if (!p.txid || !p.endToEndId) continue;
    const cents = Math.round(Number(p.valor) * 100);
    if (!Number.isFinite(cents)) continue;
    const rows = await query(
      `UPDATE gift_orders SET status='confirmed', confirmed_at=now(), end_to_end_id=$2
       WHERE txid=$1 AND status IN ('pending','reported') AND $3 >= amount_cents RETURNING id`,
      [p.txid, p.endToEndId, cents],
    );
    confirmed += rows.length;
  }
  return json({ ok: true, confirmed });
}

// Alguns PSPs validam a URL cadastrada com um GET.
export async function GET() {
  return json({ ok: true });
}
