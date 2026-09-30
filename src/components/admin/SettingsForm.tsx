"use client";
import { useState } from "react";
import type { Settings } from "@/lib/types";
import ImageField from "./ImageField";

function Text({ label, value, onChange, area, type = "text", placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void; area?: boolean; type?: string; placeholder?: string; hint?: string;
}) {
  const id = label.replace(/\W/g, "");
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {area ? (
        <textarea id={id} className="input" rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input id={id} type={type} className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Card({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className="space-y-4 rounded-2xl border border-line bg-paper p-5 md:p-7">
      <div>
        <h2 className="h-display text-2xl">{title}</h2>
        {note && <p className="mt-1 text-xs text-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [s, setS] = useState<Settings>(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));
  const nest = <K extends "venue" | "dressCode" | "pix" | "whatsapp" | "social">(k: K, patch: Partial<Settings[K]>) =>
    setS((p) => ({ ...p, [k]: { ...p[k], ...patch } }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const r = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
      const d = await r.json().catch(() => ({}));
      setMsg(r.ok ? { ok: true, text: "Alterações salvas! O site já está atualizado." } : { ok: false, text: d.error ?? "Erro ao salvar." });
    } catch {
      setMsg({ ok: false, text: "Sem conexão." });
    } finally {
      setSaving(false);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }

  const move = <T,>(arr: T[], i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= arr.length) return arr;
    const c = [...arr];
    [c[i], c[j]] = [c[j], c[i]];
    return c;
  };

  return (
    <form onSubmit={save} className="space-y-6 pb-28">
      <Card title="Os noivos e a data">
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Nome da noiva" value={s.brideName} onChange={(v) => set("brideName", v)} />
          <Text label="Nome do noivo" value={s.groomName} onChange={(v) => set("groomName", v)} />
          <Text label="Data do casamento" type="date" value={s.weddingDate} onChange={(v) => set("weddingDate", v)} />
          <Text label="Horário" type="time" value={s.weddingTime} onChange={(v) => set("weddingTime", v)} />
          <Text label="Confirmar presença até" type="date" value={s.rsvpDeadline} onChange={(v) => set("rsvpDeadline", v)} />
        </div>
        <Text label="Frase da página inicial" value={s.heroTagline} onChange={(v) => set("heroTagline", v)} />
      </Card>

      <Card title="Fotos principais" note="Ao enviar, a foto é otimizada automaticamente (máx. 2000 px).">
        <ImageField label="Foto da página inicial (Hero)" value={s.heroImage} onChange={(v) => set("heroImage", v)} />
        <ImageField label="Imagem de compartilhamento (WhatsApp). Vazio = usa a foto principal" value={s.seoImage} onChange={(v) => set("seoImage", v)} />
      </Card>

      <Card title="Local e mapa">
        <Text label="Nome do local" value={s.venue.name} onChange={(v) => nest("venue", { name: v })} />
        <Text label="Endereço completo" value={s.venue.address} onChange={(v) => nest("venue", { address: v })} />
        <Text label="Link do Google Maps (opcional)" value={s.venue.mapsUrl} onChange={(v) => nest("venue", { mapsUrl: v })} hint="Se vazio, o botão “Como chegar” busca pelo endereço acima." />
        <Text label="URL do mapa incorporado (opcional)" value={s.venue.embedUrl} onChange={(v) => nest("venue", { embedUrl: v })} hint="No Google Maps: Compartilhar → Incorporar um mapa → copie somente o endereço do src." />
      </Card>

      <Card title="Programação">
        {s.timeline.map((t, i) => (
          <div key={i} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[6rem_1fr_1fr_auto]">
            <input className="input" type="time" aria-label="Horário" value={t.time} onChange={(e) => set("timeline", s.timeline.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)))} />
            <input className="input" placeholder="Título" aria-label="Título" value={t.title} onChange={(e) => set("timeline", s.timeline.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
            <input className="input" placeholder="Descrição (opcional)" aria-label="Descrição" value={t.description ?? ""} onChange={(e) => set("timeline", s.timeline.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
            <div className="flex items-center gap-2 text-sm">
              <button type="button" onClick={() => set("timeline", move(s.timeline, i, -1))} aria-label="Subir">↑</button>
              <button type="button" onClick={() => set("timeline", move(s.timeline, i, 1))} aria-label="Descer">↓</button>
              <button type="button" className="text-[#b4483d]" onClick={() => set("timeline", s.timeline.filter((_, j) => j !== i))} aria-label="Remover">✕</button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => set("timeline", [...s.timeline, { time: "", title: "", description: "" }])}>Adicionar horário</button>
      </Card>

      <Card title="Dress code">
        <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={s.dressCode.enabled} onChange={(e) => nest("dressCode", { enabled: e.target.checked })} /> Exibir seção no site</label>
        <Text label="Traje" value={s.dressCode.title} onChange={(v) => nest("dressCode", { title: v })} />
        <Text area label="Texto" value={s.dressCode.text} onChange={(v) => nest("dressCode", { text: v })} />
        <Text area label="Dicas (uma por linha)" value={s.dressCode.tips.join("\n")} onChange={(v) => nest("dressCode", { tips: v.split("\n").map((x) => x.trim()).filter(Boolean) })} />
      </Card>

      <Card title="Perguntas frequentes">
        {s.faq.map((f, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-line p-3">
            <input className="input" placeholder="Pergunta" aria-label="Pergunta" value={f.q} onChange={(e) => set("faq", s.faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} />
            <textarea className="input" rows={2} placeholder="Resposta" aria-label="Resposta" value={f.a} onChange={(e) => set("faq", s.faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} />
            <div className="flex gap-4 text-sm">
              <button type="button" onClick={() => set("faq", move(s.faq, i, -1))}>↑ Subir</button>
              <button type="button" onClick={() => set("faq", move(s.faq, i, 1))}>↓ Descer</button>
              <button type="button" className="text-[#b4483d]" onClick={() => set("faq", s.faq.filter((_, j) => j !== i))}>Remover</button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => set("faq", [...s.faq, { q: "", a: "" }])}>Adicionar pergunta</button>
      </Card>

      <Card title="Pix" note="A chave Pix é pública por natureza (aparece no QR Code). Confira os dados: o valor vai direto para essa conta.">
        <Text label="Chave Pix" value={s.pix.key} onChange={(v) => nest("pix", { key: v })} placeholder="CPF, e-mail, telefone (+5541999999999) ou chave aleatória" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Nome do recebedor (máx. 25)" value={s.pix.receiverName} onChange={(v) => nest("pix", { receiverName: v.slice(0, 25) })} />
          <Text label="Cidade (máx. 15)" value={s.pix.city} onChange={(v) => nest("pix", { city: v.slice(0, 15) })} />
        </div>
      </Card>

      <Card title="Contato e redes sociais">
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="WhatsApp (com DDD)" type="tel" value={s.whatsapp.number} onChange={(v) => nest("whatsapp", { number: v })} placeholder="41999999999" hint="Vazio = esconde o botão." />
          <Text label="Mensagem inicial do WhatsApp" value={s.whatsapp.message} onChange={(v) => nest("whatsapp", { message: v })} />
          <Text label="Instagram" value={s.social.instagram} onChange={(v) => nest("social", { instagram: v })} placeholder="@usuario" />
          <Text label="Hashtag do casamento" value={s.social.hashtag} onChange={(v) => nest("social", { hashtag: v })} />
        </div>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <p className={`text-sm ${msg ? (msg.ok ? "text-sage" : "text-[#b4483d]") : "text-muted"}`} role="status">{msg?.text ?? "Lembre-se de salvar as alterações."}</p>
          <button className="btn btn-solid btn-sm" disabled={saving}>{saving ? "Salvando…" : "Salvar alterações"}</button>
        </div>
      </div>
    </form>
  );
}
