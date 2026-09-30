import type { Settings } from "./types";
import { formatDateLong } from "./format";

export function siteUrl(): string {
  const u =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    "http://localhost:3000";
  return u.replace(/\/$/, "");
}

export function whatsappLink(s: Settings): string | null {
  let n = s.whatsapp.number.replace(/\D/g, "");
  if (n.length < 10) return null;
  if (n.length <= 11) n = "55" + n;
  return `https://wa.me/${n}?text=${encodeURIComponent(s.whatsapp.message)}`;
}
export function ogTitle(s: Settings) {
  return `Casamento de ${s.brideName} & ${s.groomName}`;
}
export function ogDescription(s: Settings) {
  return `${formatDateLong(s.weddingDate)} — Esperamos você para celebrar conosco.`;
}
