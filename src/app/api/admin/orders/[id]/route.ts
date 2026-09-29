import { z } from "zod";
import { query } from "@/server/db";
import { badRequest, guardAdmin, json, sameOrigin } from "@/server/http";

const schema = z.object({ status: z.enum(["pending", "reported", "confirmed", "cancelled"]) });

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Origem inválida." }, 403);
  const denied = await guardAdmin();
  if (denied) return denied;
  const id = Number((await ctx.params).id);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!Number.isInteger(id) || !parsed.success) return badRequest("Dados inválidos.");
  const rows = await query(
    `UPDATE gift_orders SET status = $2::text,
       confirmed_at = CASE WHEN $2::text = 'confirmed' THEN COALESCE(confirmed_at, now()) ELSE NULL END
     WHERE id = $1 RETURNING id, status`,
    [id, parsed.data.status],
  );
  if (!rows[0]) return json({ error: "Não encontrado." }, 404);
  return json(rows[0]);
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Origem inválida." }, 403);
  const denied = await guardAdmin();
  if (denied) return denied;
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return badRequest("ID inválido.");
  await query("DELETE FROM gift_orders WHERE id = $1", [id]);
  return json({ ok: true });
}
