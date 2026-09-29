import { query } from "@/server/db";
import { getSettings } from "@/server/settings";
import { formatDateLong, formatDateShort, formatWeekday, weddingTimestamp } from "@/lib/format";
import { mapsEmbed, mapsLink, whatsappLink } from "@/lib/site";
import type { Gift } from "@/lib/types";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import Countdown from "@/components/Countdown";
import Gallery from "@/components/Gallery";
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

        {/* ---------------- NOSSA HISTÓRIA ---------------- */}
        <section id="historia" className="px-5 py-24 md:py-36">
          <div className="mx-auto max-w-6xl">
            <SectionTitle eyebrow="Do primeiro olhar ao sim" title={s.story.title} />
            <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
              <Reveal className="photo-frame relative mx-auto w-full max-w-md">
                <div className="absolute -bottom-4 -right-4 h-full w-full rounded-t-[12rem] rounded-b-3xl border border-gold/50" aria-hidden />
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-[12rem] rounded-b-3xl bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.story.image} alt="Os noivos" loading="lazy" decoding="async" className="parallax h-full w-full object-cover" />
                </div>
              </Reveal>
              <div className="space-y-10">
                <Reveal>
                  <p className="eyebrow">01</p>
                  <h3 className="h-display mt-2 text-3xl md:text-4xl">{s.story.meetingTitle}</h3>
                  <p className="mt-3 text-muted">{s.story.meetingText}</p>
                </Reveal>
                <Reveal delay={120}>
                  <p className="eyebrow">02</p>
                  <h3 className="h-display mt-2 text-3xl md:text-4xl">{s.story.proposalTitle}</h3>
                  <p className="mt-3 text-muted">{s.story.proposalText}</p>
                </Reveal>
                <Reveal delay={240}>
                  <blockquote className="h-display border-l border-gold pl-6 text-2xl italic leading-snug text-ink/85 md:text-3xl">
                    {s.story.message}
                  </blockquote>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- NOSSO GRANDE DIA ---------------- */}
        <section id="grande-dia" className="bg-blush/60 px-5 py-24 md:py-32">
          <div className="mx-auto max-w-6xl">
            <SectionTitle eyebrow="Salve a data" title="Nosso grande dia" />
            <div className="grid gap-10 md:grid-cols-2 md:gap-14">
              <Reveal className="space-y-8 text-center md:text-left">
                <div>
                  <p className="eyebrow">Data</p>
                  <p className="h-display mt-2 text-3xl capitalize md:text-4xl">{formatWeekday(s.weddingDate)}</p>
                  <p className="h-display text-3xl md:text-4xl">{dateLong}</p>
                </div>
                <div>
                  <p className="eyebrow">Horário</p>
                  <p className="h-display mt-2 text-3xl md:text-4xl">{s.weddingTime.replace(":", "h")}</p>
                </div>
                <div>
                  <p className="eyebrow">Local</p>
                  <p className="h-display mt-2 text-3xl md:text-4xl">{s.venue.name}</p>
                  <p className="mt-1 text-muted">{s.venue.address}</p>
                </div>
                <a href={mapsLink(s)} target="_blank" rel="noopener noreferrer" className="btn btn-solid">
                  Como chegar
                </a>
              </Reveal>
              <Reveal delay={150}>
                <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-sand md:aspect-auto md:h-full md:min-h-[22rem]">
                  <iframe
                    title="Mapa do local do casamento"
                    src={mapsEmbed(s)}
                    className="h-full w-full border-0 grayscale-[0.25]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------- PROGRAMAÇÃO ---------------- */}
        {s.timeline.length > 0 && (
          <section id="programacao" className="px-5 py-24 md:py-36">
            <div className="mx-auto max-w-2xl">
              <SectionTitle eyebrow="Passo a passo" title="Programação" />
              <ol className="relative">
                <span className="tl-line absolute bottom-0 left-[5rem] top-0 w-px sm:left-1/2" aria-hidden />
                {s.timeline.map((t, i) => (
                  <Reveal as="li" key={i} delay={i * 60} className="relative grid grid-cols-[4rem_1fr] items-start gap-x-8 pb-12 last:pb-0 sm:grid-cols-[1fr_1fr] sm:gap-x-16">
                    <span className="h-display pt-0.5 text-right text-3xl text-gold-dark sm:text-4xl">{t.time}</span>
                    <span className="absolute left-[5rem] top-4 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-gold bg-ivory sm:left-1/2" aria-hidden />
                    <div>
                      <h3 className="h-display text-2xl sm:text-3xl">{t.title}</h3>
                      {t.description && <p className="mt-1 text-sm text-muted">{t.description}</p>}
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* ---------------- DRESS CODE ---------------- */}
        {s.dressCode.enabled && (
          <section id="traje" className="bg-ink px-5 py-24 text-paper md:py-32">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="eyebrow !text-gold">Dress code</p>
              <h2 className="h-display mt-4 text-5xl md:text-6xl">Traje: {s.dressCode.title}</h2>
              <div className="mx-auto mt-6 h-px w-12 bg-gold" />
              <p className="mx-auto mt-6 max-w-xl text-paper/75">{s.dressCode.text}</p>
              {s.dressCode.tips.length > 0 && (
                <ul className="mx-auto mt-10 grid max-w-2xl gap-4 text-left sm:grid-cols-3">
                  {s.dressCode.tips.map((t, i) => (
                    <li key={i} className="rounded-2xl border border-paper/15 p-5 text-sm text-paper/80">
                      <span className="h-display mb-2 block text-2xl text-gold">0{i + 1}</span>
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          </section>
        )}

        {/* ---------------- GALERIA ---------------- */}
        {s.gallery.length > 0 && (
          <section id="galeria" className="px-5 py-24 md:py-36">
            <div className="mx-auto max-w-6xl">
              <SectionTitle eyebrow="Momentos" title="Galeria" sub={s.social.hashtag || undefined} />
              <Reveal>
                <Gallery items={s.gallery} />
              </Reveal>
            </div>
          </section>
        )}

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
              sub="Nossos presentes são simbólicos: cada um representa um pedacinho da nossa lua de mel. Escolha o seu e envie o valor por Pix, direto para nós."
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

        {/* ---------------- FAQ ---------------- */}
        {s.faq.length > 0 && (
          <section id="faq" className="bg-blush/60 px-5 py-24 md:py-32">
            <div className="mx-auto max-w-3xl">
              <SectionTitle eyebrow="Dúvidas" title="Perguntas frequentes" />
              <Reveal className="divide-y divide-line border-y border-line">
                {s.faq.map((f, i) => (
                  <details key={i} className="group py-1">
                    <summary className="flex min-h-14 items-center justify-between gap-6 py-3">
                      <span className="h-display text-xl md:text-2xl">{f.q}</span>
                      <span className="plus text-2xl text-gold" aria-hidden>+</span>
                    </summary>
                    <p className="pb-5 pr-10 text-muted">{f.a}</p>
                  </details>
                ))}
              </Reveal>
            </div>
          </section>
        )}
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
        <p className="mt-12 text-xs text-muted/70">Feito com ❤️ para celebrar o amor</p>
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
            <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.5A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 1 1-4.2 15.03l-.3-.18-3.1.89.9-3.02-.2-.31A8.1 8.1 0 0 1 12.04 3.8zm-3.1 3.9c-.2 0-.5.07-.75.35-.26.28-1 1-1 2.4s1.02 2.78 1.17 2.97c.14.2 2 3.2 4.94 4.36 2.44.96 2.94.77 3.47.72.53-.05 1.7-.7 1.94-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.2-.55-.34-.29-.15-1.7-.84-1.97-.94-.26-.1-.46-.14-.65.15-.2.29-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.14-1.2-.44-2.3-1.42-.85-.76-1.43-1.7-1.6-1.98-.16-.29-.02-.44.13-.58.13-.13.29-.34.43-.5.14-.17.19-.29.29-.48.1-.2.05-.36-.02-.5-.08-.15-.65-1.6-.9-2.18-.23-.56-.47-.48-.65-.49h-.55z" />
          </svg>
        </a>
      )}
    </>
  );
}
