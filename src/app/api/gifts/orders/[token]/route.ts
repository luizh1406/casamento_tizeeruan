import { queryOne } from "@/server/db";
import { json } from "@/server/http";

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!/^[a-f0-9]{32}$/.test(token)) return json({ error: "Não encontrado." }, 404);
  const o = await queryOne<{ status: string }>("SELECT status FROM gift_orders WHERE public_token = $1", [token]);
  if (!o) return json({ error: "Não encontrado." }, 404);
  return json({ status: o.status });
}
