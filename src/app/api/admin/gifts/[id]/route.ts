import { query } from "@/server/db";
import { badRequest, guardAdmin, json, sameOrigin } from "@/server/http";
import { giftSchema } from "../schema";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Origem inválida." }, 403);
  const denied = await guardAdmin();
  if (denied) return denied;
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return badRequest("ID inválido.");
  const parsed = giftSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);
  const g = parsed.data;
  const rows = await query(
    `UPDATE gifts SET name=$2, description=$3, image_url=$4, amount_cents=$5, active=$6, sort_order=$7
     WHERE id=$1 RETURNING *`,
    [id, g.name, g.description, g.imageUrl, g.amountCents, g.active, g.sortOrder],
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
  await query("DELETE FROM gifts WHERE id=$1", [id]);
  return json({ ok: true });
}
