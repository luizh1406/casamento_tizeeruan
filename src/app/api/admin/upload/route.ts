import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { query } from "@/server/db";
import { badRequest, guardAdmin, json, sameOrigin } from "@/server/http";

export const runtime = "nodejs";
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Origem inválida." }, 403);
  const denied = await guardAdmin();
  if (denied) return denied;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return badRequest("Envie um arquivo de imagem.");
  if (file.size > MAX_BYTES) return badRequest("A imagem deve ter no máximo 8 MB.");

  try {
    const input = Buffer.from(await file.arrayBuffer());
    // Decodifica de verdade (rejeita arquivos que não são imagem), corrige rotação e otimiza.
    const out = await sharp(input, { failOn: "error" })
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    const id = randomBytes(12).toString("hex");
    await query("INSERT INTO media (id, mime, data) VALUES ($1,$2,$3)", [id, "image/jpeg", out]);
    return json({ url: `/api/media/${id}` });
  } catch {
    return badRequest("Não foi possível processar essa imagem. Use JPG, PNG ou WebP.");
  }
}
