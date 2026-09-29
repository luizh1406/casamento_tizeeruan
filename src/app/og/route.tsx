import { ImageResponse } from "next/og";
import sharp from "sharp";
import { getSettings } from "@/server/settings";
import { queryOne } from "@/server/db";
import { formatDateLong } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function heroDataUrl(src: string): Promise<string | null> {
  const m = src.match(/^\/api\/media\/([a-f0-9]{24})$/);
  if (!m) return null; // placeholders SVG e URLs externas: usa apenas o fundo elegante
  const row = await queryOne<{ data: Uint8Array }>("SELECT data FROM media WHERE id = $1", [m[1]]);
  if (!row) return null;
  const jpg = await sharp(Buffer.from(row.data)).resize(1200, 630, { fit: "cover" }).jpeg({ quality: 78 }).toBuffer();
  return `data:image/jpeg;base64,${jpg.toString("base64")}`;
}

export async function GET() {
  const s = await getSettings();
  const photo = await heroDataUrl(s.seoImage || s.heroImage).catch(() => null);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "linear-gradient(135deg,#e6d6c3,#a88f78)", fontFamily: "serif" }}>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} width={1200} height={630} alt="" style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
        )}
        <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(to top, rgba(30,22,16,.78), rgba(30,22,16,.15) 70%)" }} />
        <div style={{ position: "absolute", left: 70, right: 70, bottom: 64, display: "flex", flexDirection: "column", color: "#fffdf9" }}>
          <div style={{ fontSize: 26, letterSpacing: 8, textTransform: "uppercase", opacity: 0.85 }}>Casamento de</div>
          <div style={{ fontSize: 92, marginTop: 8, lineHeight: 1.05 }}>{`${s.brideName} & ${s.groomName}`}</div>
          <div style={{ fontSize: 32, marginTop: 16, opacity: 0.92 }}>{`${formatDateLong(s.weddingDate)} — Esperamos você para celebrar conosco.`}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } },
  );
}
