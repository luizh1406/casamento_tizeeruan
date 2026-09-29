"use client";
import { useRef, useState } from "react";

type Fields = Record<string, string>;

function maskPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function RsvpForm({ deadlineLabel }: { deadlineLabel: string }) {
  const startedAt = useRef(Date.now());
  const [attending, setAttending] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [count, setCount] = useState(0);
  const [companions, setCompanions] = useState("");
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Fields>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | boolean>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const errs: Fields = {};
    if (attending === null) errs.attending = "Escolha uma opção.";
    if (name.trim().length < 3) errs.name = "Informe seu nome completo.";
    if (phone.replace(/\D/g, "").length < 10) errs.phone = "Informe um telefone com DDD.";
    if (attending && count > 0 && !companions.trim()) errs.companionsNames = "Informe o nome dos acompanhantes.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone, attending, companionsCount: attending ? count : 0,
          companionsNames: attending ? companions : "", notes, website, startedAt: startedAt.current,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.fields ?? {});
        setFormError(data.error ?? "Não foi possível enviar. Tente novamente.");
        return;
      }
      setDone(Boolean(attending));
    } catch {
      setFormError("Sem conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (done !== null) {
    return (
      <div className="fade-in mx-auto max-w-xl rounded-3xl border border-line bg-paper px-8 py-14 text-center">
        <div className="heartbeat mb-4 text-4xl text-gold">❤</div>
        <h3 className="h-display text-4xl">{done ? "Presença confirmada!" : "Recebemos sua resposta"}</h3>
        <p className="mt-3 text-muted">
          {done ? "Estamos esperando você ❤️" : "Sentiremos a sua falta, mas agradecemos o carinho de avisar."}
        </p>
        <button type="button" className="mt-8 text-xs uppercase tracking-[0.22em] text-gold-dark underline underline-offset-4" onClick={() => setDone(null)}>
          Alterar minha resposta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-xl space-y-6 rounded-3xl border border-line bg-paper p-6 sm:p-10">
      <fieldset>
        <legend className="label">Confirma presença?</legend>
        <div className="grid grid-cols-2 gap-3">
          {([[true, "Sim, estarei lá"], [false, "Não poderei ir"]] as const).map(([v, label]) => (
            <button
              key={String(v)}
              type="button"
              aria-pressed={attending === v}
              onClick={() => setAttending(v)}
              className={`min-h-14 rounded-xl border px-3 text-sm transition-all ${
                attending === v ? "border-ink bg-ink text-paper" : "border-line bg-ivory hover:border-gold"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {errors.attending && <p className="err">{errors.attending}</p>}
      </fieldset>

      <div className="field">
        <label htmlFor="rsvp-name">Nome completo</label>
        <input id="rsvp-name" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} aria-invalid={!!errors.name} />
        {errors.name && <p className="err">{errors.name}</p>}
      </div>

      <div className="field">
        <label htmlFor="rsvp-phone">Telefone / WhatsApp</label>
        <input id="rsvp-phone" className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} aria-invalid={!!errors.phone} />
        {errors.phone && <p className="err">{errors.phone}</p>}
      </div>

      {attending && (
        <div className="fade-in space-y-6">
          <div className="field">
            <label htmlFor="rsvp-count">Número de acompanhantes</label>
            <div className="flex items-center gap-3">
              <button type="button" className="h-12 w-12 rounded-full border border-line text-xl" onClick={() => setCount((c) => Math.max(0, c - 1))} aria-label="Menos um acompanhante">−</button>
              <output id="rsvp-count" className="h-display w-10 text-center text-3xl">{count}</output>
              <button type="button" className="h-12 w-12 rounded-full border border-line text-xl" onClick={() => setCount((c) => Math.min(10, c + 1))} aria-label="Mais um acompanhante">+</button>
            </div>
          </div>
          {count > 0 && (
            <div className="field fade-in">
              <label htmlFor="rsvp-comp">Nome dos acompanhantes</label>
              <textarea id="rsvp-comp" className="input" rows={3} value={companions} onChange={(e) => setCompanions(e.target.value)} maxLength={400} placeholder="Um nome por linha" aria-invalid={!!errors.companionsNames} />
              {errors.companionsNames && <p className="err">{errors.companionsNames}</p>}
            </div>
          )}
        </div>
      )}

      <div className="field">
        <label htmlFor="rsvp-notes">Observação (opcional)</label>
        <textarea id="rsvp-notes" className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={600} placeholder="Restrição alimentar, recado carinhoso…" />
      </div>

      {/* honeypot: invisível para pessoas, tentador para robôs */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Não preencha
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      {formError && <p className="err text-center" role="alert">{formError}</p>}
      <button type="submit" className="btn btn-solid w-full" disabled={loading}>
        {loading ? "Enviando…" : "Enviar resposta"}
      </button>
      <p className="text-center text-xs text-muted">Por favor, responda até {deadlineLabel}.</p>
    </form>
  );
}
