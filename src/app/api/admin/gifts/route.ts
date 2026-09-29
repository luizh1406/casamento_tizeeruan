import { query } from "@/server/db";
import { badRequest, guardAdmin, json, sameOrigin } from "@/server/http";
import { giftSchema } from "./schema";

export async function GET() {
  const denied = await guardAdmin();
  if (denied) return denied;
  return json(await query("SELECT * FROM gifts ORDER BY sort_order, id"));
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Origem inválida." }, 403);
  const denied = await guardAdmin();
  if (denied) return denied;
  const parsed = giftSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0].message);
  const g = parsed.data;
  const rows = await query(
    `INSERT INTO gifts (name, description, image_url, amount_cents, active, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [g.name, g.description, g.imageUrl, g.amountCents, g.active, g.sortOrder],
  );
  return json(rows[0], 201);
}
