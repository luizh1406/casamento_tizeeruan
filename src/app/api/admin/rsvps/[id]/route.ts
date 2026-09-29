import { query } from "@/server/db";
import { badRequest, guardAdmin, json, sameOrigin } from "@/server/http";

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Origem inválida." }, 403);
  const denied = await guardAdmin();
  if (denied) return denied;
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return badRequest("ID inválido.");
  await query("DELETE FROM rsvps WHERE id = $1", [id]);
  return json({ ok: true });
}
