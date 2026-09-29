import { z } from "zod";
import { getSettings, saveSettings } from "@/server/settings";
import { badRequest, guardAdmin, json, sameOrigin } from "@/server/http";
import type { Settings } from "@/lib/types";

const str = (max = 300) => z.string().trim().max(max);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.");
const time = z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido.");
const url = z.string().trim().max(600).refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v), "URL inválida.");

const schema = z.object({
  brideName: str(60).min(1),
  groomName: str(60).min(1),
  weddingDate: date,
  weddingTime: time,
  rsvpDeadline: date,
  heroTagline: str(200),
  heroImage: url,
  story: z.object({
    title: str(80),
    image: url,
    meetingTitle: str(80),
    meetingText: str(800),
    proposalTitle: str(80),
    proposalText: str(800),
    message: str(600),
  }),
  venue: z.object({ name: str(120), address: str(250), mapsUrl: url, embedUrl: url }),
  timeline: z.array(z.object({ time: str(20), title: str(100), description: str(200).optional() })).max(30),
  dressCode: z.object({ enabled: z.boolean(), title: str(80), text: str(400), tips: z.array(str(200)).max(10) }),
  faq: z.array(z.object({ q: str(200), a: str(1000) })).max(30),
  gallery: z.array(z.object({ src: url, alt: str(150) })).max(30),
  pix: z.object({ key: str(140), receiverName: str(25), city: str(15) }),
  whatsapp: z.object({ number: str(20), message: str(300) }),
  social: z.object({ instagram: str(100), hashtag: str(60) }),
  seoImage: url,
});

export async function GET() {
  const denied = await guardAdmin();
  if (denied) return denied;
  return json(await getSettings());
}

export async function PUT(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Origem inválida." }, 403);
  const denied = await guardAdmin();
  if (denied) return denied;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return badRequest(`Campo inválido (${i.path.join(".")}): ${i.message}`);
  }
  await saveSettings(parsed.data as Settings);
  return json({ ok: true });
}
