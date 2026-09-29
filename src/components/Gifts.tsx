"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatBRL, parseBRLToCents } from "@/lib/format";
import { MAX_CENTS, MIN_CENTS } from "@/lib/limits";

export interface GiftCard {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  amountCents: number | null;
}

/** null = "Quero escolher outro valor" (sem presente específico) */
type Target = { gift: GiftCard | null; forceCustom: boolean };

interface Created {
  token: string;
  giftName: string;
  amountCents: number;
  payload: string;
  qr: string;
}
type Step = "form" | "pix" | "done";

export default function Gifts({ gifts, pixReady }: { gifts: GiftCard[]; pixReady: boolean }) {
  const [target, setTarget] = useState<Target | null>(null);
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {gifts.map((g) => (
          <article key={g.id} className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-paper transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-28px_rgba(90,65,40,0.45)]">
            <div className="photo-frame relative aspect-[4/3] overflow-hidden bg-sand">
              {g.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.imageUrl} alt="" loading="lazy" decoding="async" className="parallax h-full w-full object-cover" />
              )}
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h3 className="h-display text-2xl leading-tight">{g.name}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{g.description}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="h-display text-2xl text-gold-dark">{g.amountCents === null ? "Valor livre" : formatBRL(g.amountCents)}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTarget({ gift: g, forceCustom: false })}>
                  Presentear
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button type="button" className="text-sm uppercase tracking-[0.2em] text-gold-dark underline underline-offset-8 hover:text-ink" onClick={() => setTarget({ gift: null, forceCustom: true })}>
          Quero escolher outro valor
        </button>
      </div>

      {target && <GiftModal target={target} pixReady={pixReady} onClose={() => setTarget(null)} />}
    </>
  );
}

function GiftModal({ target, pixReady, onClose }: { target: Target; pixReady: boolean; onClose: () => void }) {
  const { gift } = target;
  const fixed = gift?.amountCents ?? null;
  const [custom, setCustom] = useState(target.forceCustom || fixed === null);
  const [amountText, setAmountText] = useState("");
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [created, setCreated] = useState<Created | null>(null);
  const [status, setStatus] = useState<"pending" | "reported" | "confirmed" | "cancelled">("pending");
  const [copied, setCopied] = useState(false);
  const [reporting, setReporting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Consulta o status do pedido (confirmado pelos noivos no painel ou por webhook).
  useEffect(() => {
    if (step !== "pix" || !created) return;
    let stop = false;
    const tick = async () => {
      try {
        const r = await fetch(`/api/gifts/orders/${created.token}`, { cache: "no-store" });
        if (!r.ok || stop) return;
        const { status: s } = await r.json();
        if (stop) return;
        setStatus(s);
        if (s === "confirmed") setStep("done");
      } catch {
        /* ignora falhas transitórias de rede */
      }
    };
    const id = setInterval(tick, 5000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [step, created]);

  const amountCents = custom || fixed === null ? parseBRLToCents(amountText) : fixed;

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const errs: Record<string, string> = {};
    if (custom || fixed === null) {
      if (amountCents === null) errs.amount = "Digite um valor válido, por exemplo 150 ou 150,50.";
      else if (amountCents < MIN_CENTS) errs.amount = "O valor mínimo é R$ 5,00.";
      else if (amountCents > MAX_CENTS) errs.amount = "O valor máximo é R$ 50.000,00.";
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const res = await fetch("/api/gifts/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftId: gift?.id ?? null,
          custom: custom && fixed !== null,
          amountCents: custom || fixed === null ? amountCents : undefined,
          guestName,
          message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.fields ?? {});
        setError(data.error ?? "Não foi possível gerar o Pix. Tente novamente.");
        return;
      }
      setCreated(data);
      setStep("pix");
    } catch {
      setError("Sem conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.payload);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = created.payload;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch { /* sem suporte */ }
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const report = useCallback(async () => {
    if (!created) return;
    setReporting(true);
    try {
      const r = await fetch(`/api/gifts/orders/${created.token}/report`, { method: "POST" });
      if (r.ok) setStatus((await r.json()).status);
    } finally {
      setReporting(false);
    }
  }, [created]);

  const title = gift?.name ?? "Presente em valor livre";

  return (
    <div className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Presentear os noivos"
        className="sheet relative max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-ivory p-6 pb-8 outline-none sm:rounded-3xl sm:p-9"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center text-2xl text-muted hover:text-ink" aria-label="Fechar">
          ×
        </button>

        {step === "form" && (
          <form onSubmit={generate} noValidate className="space-y-5">
            <div className="pr-8">
              <p className="eyebrow">Você escolheu presentear os noivos com:</p>
              <h3 className="h-display mt-3 text-3xl leading-tight">{title}</h3>
              {gift?.description && <p className="mt-2 text-sm text-muted">{gift.description}</p>}
            </div>

            {!custom && fixed !== null ? (
              <div className="rounded-2xl border border-line bg-paper p-5 text-center">
                <p className="label !mb-1">Valor</p>
                <p className="h-display text-4xl text-gold-dark">{formatBRL(fixed)}</p>
                <button type="button" className="mt-2 text-xs uppercase tracking-[0.2em] text-muted underline underline-offset-4 hover:text-ink" onClick={() => setCustom(true)}>
                  Quero escolher outro valor
                </button>
              </div>
            ) : (
              <div className="field">
                <label htmlFor="gift-amount">Quanto você quer presentear?</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">R$</span>
                  <input
                    id="gift-amount"
                    className="input !pl-11"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0,00"
                    value={amountText}
                    onChange={(e) => setAmountText(e.target.value.replace(/[^\d.,]/g, "").slice(0, 12))}
                    aria-invalid={!!errors.amount}
                    autoFocus
                  />
                </div>
                {errors.amount && <p className="err">{errors.amount}</p>}
                {fixed !== null && (
                  <button type="button" className="mt-2 text-xs uppercase tracking-[0.2em] text-muted underline underline-offset-4 hover:text-ink" onClick={() => { setCustom(false); setErrors({}); }}>
                    Voltar para {formatBRL(fixed)}
                  </button>
                )}
              </div>
            )}

            <div className="field">
              <label htmlFor="gift-name">Seu nome (opcional)</label>
              <input id="gift-name" className="input" autoComplete="name" value={guestName} onChange={(e) => setGuestName(e.target.value)} maxLength={100} />
            </div>
            <div className="field">
              <label htmlFor="gift-msg">Mensagem para os noivos (opcional)</label>
              <textarea id="gift-msg" className="input" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} placeholder="Deixe um recado carinhoso…" />
            </div>

            {!pixReady && <p className="err text-center">Os noivos ainda estão configurando o Pix. Volte em breve!</p>}
            {error && <p className="err text-center" role="alert">{error}</p>}
            <button type="submit" className="btn btn-solid w-full" disabled={loading || !pixReady}>
              {loading ? "Gerando Pix…" : custom || fixed === null ? "Presentear via Pix" : "Pagar com Pix"}
            </button>
          </form>
        )}

        {step === "pix" && created && (
          <div className="space-y-5 text-center">
            <div className="pr-8 text-left">
              <p className="eyebrow">Pagar com Pix</p>
              <h3 className="h-display mt-3 text-3xl leading-tight">{created.giftName}</h3>
              <p className="h-display mt-1 text-3xl text-gold-dark">{formatBRL(created.amountCents)}</p>
            </div>

            {status === "reported" ? (
              <div className="fade-in rounded-2xl border border-line bg-paper p-6">
                <div className="heartbeat text-3xl text-gold">❤</div>
                <p className="h-display mt-2 text-2xl">Obrigado!</p>
                <p className="mt-2 text-sm text-muted">
                  Assim que os noivos confirmarem o recebimento do Pix, o presente aparecerá como enviado. Você já pode fechar esta janela.
                </p>
              </div>
            ) : null}

            <div className="mx-auto w-fit rounded-2xl border border-line bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={created.qr} alt="QR Code Pix" width={240} height={240} className="h-60 w-60" />
            </div>
            <p className="text-sm text-muted">Abra o app do seu banco, escolha <strong className="font-normal text-ink">Pix</strong> e leia o QR Code — ou use o código abaixo.</p>

            <button type="button" onClick={copy} className={`btn w-full ${copied ? "btn-solid pop" : "btn-ghost"}`} aria-live="polite">
              {copied ? "✓ Código copiado!" : "Copiar código Pix"}
            </button>
            <p className="break-all rounded-xl bg-sand/60 p-3 text-left text-[0.7rem] leading-snug text-muted select-all">{created.payload}</p>

            {status !== "reported" && (
              <button type="button" onClick={report} disabled={reporting} className="text-xs uppercase tracking-[0.2em] text-gold-dark underline underline-offset-4">
                {reporting ? "Enviando…" : "Já fiz o pagamento"}
              </button>
            )}
            <p className="text-xs text-muted">O presente só é marcado como enviado após a confirmação do recebimento pelos noivos.</p>
          </div>
        )}

        {step === "done" && (
          <div className="fade-in px-2 py-10 text-center">
            <div className="heartbeat text-5xl text-gold">❤</div>
            <h3 className="h-display mt-5 text-4xl">Presente enviado ❤️</h3>
            <p className="mx-auto mt-3 max-w-xs text-muted">Obrigado por fazer parte desse momento tão especial.</p>
            <button type="button" className="btn btn-ghost mt-8" onClick={onClose}>Fechar</button>
          </div>
        )}
      </div>
    </div>
  );
}
