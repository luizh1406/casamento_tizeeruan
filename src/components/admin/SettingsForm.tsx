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
  const nest = <K extends "pix" | "whatsapp" | "social">(k: K, patch: Partial<Settings[K]>) =>
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
