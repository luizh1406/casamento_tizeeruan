import { query } from "@/server/db";
import { clientKey, json, rateLimit, sameOrigin } from "@/server/http";

/** O convidado informa que já pagou. NÃO confirma o pagamento: apenas sinaliza aos noivos. */
export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Origem inválida." }, 403);
  const { token } = await ctx.params;
  if (!/^[a-f0-9]{32}$/.test(token)) return json({ error: "Não encontrado." }, 404);
  if (!(await rateLimit(`report:${clientKey(req)}`, 30, 3600))) return json({ error: "Muitas tentativas." }, 429);
  const rows = await query<{ status: string }>(
    `UPDATE gift_orders SET
       reported_at = CASE WHEN status = 'pending' THEN now() ELSE reported_at END,
       status = CASE WHEN status = 'pending' THEN 'reported' ELSE status END
     WHERE public_token = $1 RETURNING status`,
    [token],
  );
  if (!rows[0]) return json({ error: "Não encontrado." }, 404);
  return json({ status: rows[0].status });
}
