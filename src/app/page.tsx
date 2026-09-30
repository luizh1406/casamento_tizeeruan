import { query } from "@/server/db";
import { getSettings } from "@/server/settings";
import { formatDateLong, formatDateShort, formatWeekday, weddingTimestamp } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import type { Gift } from "@/lib/types";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import Countdown from "@/components/Countdown";
import RsvpForm from "@/components/RsvpForm";
import Gifts, { type GiftCard } from "@/components/Gifts";

export const dynamic = "force-dynamic";

function SectionTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="h-display mt-4 text-5xl md:text-6xl">{title}</h2>
      <div className="mx-auto mt-6 h-px w-12 bg-gold" />
      {sub && <p className="mt-6 text-muted">{sub}</p>}
    </Reveal>
  );
}

export default async function Home() {
  const [s, giftRows] = await Promise.all([
    getSettings(),
    query<Gift>("SELECT * FROM gifts WHERE active = TRUE ORDER BY sort_order, id"),
  ]);
  const gifts: GiftCard[] = giftRows.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    imageUrl: g.image_url,
    amountCents: g.amount_cents,
  }));
  const target = weddingTimestamp(s.weddingDate, s.weddingTime);
  const wa = whatsappLink(s);
  const initials = `${s.brideName.charAt(0)} & ${s.groomName.charAt(0)}`;
  const dateLong = formatDateLong(s.weddingDate);

  return (
    <>
      <Nav initials={initials} />
      <main id="topo">
        {/* ---------------- HERO ---------------- */}
        <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink text-white md:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.heroImage} alt={`${s.brideName} e ${s.groomName}`} className="hero-img absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/25" />
          <div className="relative mx-auto w-full max-w-4xl px-5 pb-16 pt-32 text-center md:py-24">
            <p className="eyebrow fadeup !text-white/80" style={{ "--d": "200ms" } as React.CSSProperties}>
              Vamos nos casar
            </p>
            <h1 className="h-display fadeup mt-5 text-[3.4rem] leading-[0.95] sm:text-7xl md:text-8xl" style={{ "--d": "400ms" } as React.CSSProperties}>
              {s.brideName}
              <span className="mx-3 italic text-gold/90">&amp;</span>
              <br className="sm:hidden" />
              {s.groomName}
            </h1>
            <p className="fadeup mt-6 text-sm uppercase tracking-[0.35em] text-white/90 sm:text-base" style={{ "--d": "700ms" } as React.CSSProperties}>
              {formatDateShort(s.weddingDate)}
            </p>
            <p className="h-display fadeup mx-auto mt-5 max-w-xl text-xl italic text-white/85 sm:text-2xl" style={{ "--d": "900ms" } as React.CSSProperties}>
              “{s.heroTagline}”
            </p>
            <div className="fadeup mt-9" style={{ "--d": "1100ms" } as React.CSSProperties}>
              <Countdown target={target} />
            </div>
            <div className="fadeup mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center" style={{ "--d": "1300ms" } as React.CSSProperties}>
              <a href="#presenca" className="btn btn-light">Confirmar presença</a>
              <a href="#presentes" className="btn btn-outline-light">Ver lista de presentes</a>
            </div>
          </div>
        </section>

        {/* ---------------- RSVP ---------------- */}
        <section id="presenca" className="bg-blush/60 px-5 py-24 md:py-32">
          <div className="mx-auto max-w-6xl">
            <SectionTitle eyebrow="RSVP" title="Confirme sua presença" sub="Sua presença é o nosso maior presente. Conte para a gente se você vem!" />
            <Reveal>
              <RsvpForm deadlineLabel={formatDateLong(s.rsvpDeadline)} />
            </Reveal>
          </div>
        </section>

        {/* ---------------- PRESENTES ---------------- */}
        <section id="presentes" className="px-5 py-24 md:py-36">
          <div className="mx-auto max-w-6xl">
            <SectionTitle
              eyebrow="Lista de presentes"
              title="Presenteie os noivos"
              sub="Nossos presentes são simbólicos. Escolha o seu e envie o valor por Pix, direto para nós."
            />
            {gifts.length > 0 ? (
              <Reveal>
                <Gifts gifts={gifts} pixReady={s.pix.key.trim().length > 0} />
              </Reveal>
            ) : (
              <p className="text-center text-muted">A lista de presentes estará disponível em breve.</p>
            )}
          </div>
        </section>

      </main>

      {/* ---------------- RODAPÉ ---------------- */}
      <footer className="px-5 py-20 text-center">
        <p className="h-display text-5xl md:text-6xl">
          {s.brideName} <span className="italic text-gold">&amp;</span> {s.groomName}
        </p>
        <p className="eyebrow mt-5">{dateLong}</p>
        {s.social.hashtag && <p className="mt-3 text-muted">{s.social.hashtag}</p>}
        {s.social.instagram && (
          <a
            href={s.social.instagram.startsWith("http") ? s.social.instagram : `https://instagram.com/${s.social.instagram.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-xs uppercase tracking-[0.25em] text-gold-dark underline underline-offset-4"
          >
            Instagram
          </a>
        )}
        <p className="mt-12 text-base text-muted">Feito com ❤️ pelos Padrinhos Luiz e Julia</p>
        <a href="/admin" className="mt-4 inline-block text-base text-muted underline underline-offset-4 hover:text-ink">Área dos noivos</a>
      </footer>

      {/* ---------------- WHATSAPP ---------------- */}
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar com os noivos no WhatsApp"
          className="fixed bottom-4 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-paper/95 text-[#2f7d54] shadow-[0_8px_24px_-10px_rgba(0,0,0,0.35)] backdrop-blur transition-transform hover:scale-105"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      )}
    </>
  );
}
