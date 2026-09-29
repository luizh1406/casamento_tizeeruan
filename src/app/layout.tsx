import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/server/settings";
import { ogDescription, ogTitle, siteUrl } from "@/lib/site";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const sans = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-jost", display: "swap" });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = ogTitle(s);
  const description = ogDescription(s);
  const image = { url: "/og", width: 1200, height: 630, alt: title };
  return {
    metadataBase: new URL(siteUrl()),
    title,
    description,
    openGraph: { title, description, type: "website", locale: "pt_BR", siteName: title, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: ["/og"] },
    robots: { index: false, follow: false }, // site privado dos convidados
  };
}

export const viewport: Viewport = { themeColor: "#faf7f2", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
