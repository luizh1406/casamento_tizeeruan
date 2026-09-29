"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Gift } from "@/lib/types";
import { formatBRL, parseBRLToCents } from "@/lib/format";
import ImageField from "./ImageField";

interface Draft {
  id: number | null;
  name: string;
  description: string;
  imageUrl: string;
  free: boolean;
  amountText: string;
  active: boolean;
  sortOrder: string;
}

const empty = (order: number): Draft => ({ id: null, name: "", description: "", imageUrl: "", free: false, amountText: "", active: true, sortOrder: String(order) });

export default function GiftManager({ gifts }: { gifts: Gift[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function edit(g: Gift) {
    setError("");
    setDraft({
      id: g.id, name: g.name, description: g.description, imageUrl: g.image_url,
      free: g.amount_cents === null, amountText: g.amount_cents === null ? "" : (g.amount_cents / 100).toFixed(2).replace(".", ","),
      active: g.active, sortOrder: String(g.sort_order),
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setError("");
    let amountCents: number | null = null;
    if (!draft.free) {
      amountCents = parseBRLToCents(draft.amountText);
      if (amountCents === null) return setError("Informe um valor válido, ex.: 150,00.");
    }
    setSaving(true);
    const body = {
      name: draft.name, description: draft.description, imageUrl: draft.imageUrl, amountCents,
      active: draft.active, sortOrder: Number(draft.sortOrder) || 0,
    };
    const r = await fetch(draft.id ? `/api/admin/gifts/${draft.id}` : "/api/admin/gifts", {
      method: draft.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    setSaving(false);
    if (!r.ok) return setError((await r.json().catch(() => ({}))).error ?? "Erro ao salvar.");
    setDraft(null);
    router.refresh();
  }

  async function remove(g: Gift) {
    if (!confirm(`Excluir "${g.name}"? Presentes já recebidos são mantidos no histórico.`)) return;
    const r = await fetch(`/api/admin/gifts/${g.id}`, { method: "DELETE" });
    if (r.ok) router.refresh();
  }
  async function toggle(g: Gift) {
    await fetch(`/api/admin/gifts/${g.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: g.name, description: g.description, imageUrl: g.image_url, amountCents: g.amount_cents, active: !g.active, sortOrder: g.sort_order }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <button className="btn btn-solid btn-sm" onClick={() => { setError(""); setDraft(empty(gifts.length)); }}>Novo presente</button>

      <div className="divide-y divide-line rounded-2xl border border-line bg-paper">
        {gifts.length === 0 && <p className="p-6 text-center text-sm text-muted">Nenhum presente cadastrado.</p>}
        {gifts.map((g) => (
          <div key={g.id} className={`flex items-center gap-4 p-4 ${g.active ? "" : "opacity-55"}`}>
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sand">
              {g.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.image_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate">{g.name}</p>
              <p className="text-xs text-muted">#{g.sort_order} · {g.amount_cents === null ? "Valor livre" : formatBRL(g.amount_cents)} · {g.active ? "Ativo" : "Inativo"}</p>
            </div>
            <div className="flex shrink-0 gap-3 text-xs">
              <button onClick={() => toggle(g)} className="text-muted hover:underline">{g.active ? "Desativar" : "Ativar"}</button>
              <button onClick={() => edit(g)} className="text-gold-dark hover:underline">Editar</button>
              <button onClick={() => remove(g)} className="text-[#b4483d] hover:underline">Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {draft && (
        <div className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-6" onClick={() => setDraft(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="sheet max-h-[94dvh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-3xl bg-ivory p-6 sm:rounded-3xl">
            <h2 className="h-display text-3xl">{draft.id ? "Editar presente" : "Novo presente"}</h2>
            <div className="field"><label htmlFor="g-name">Nome</label><input id="g-name" className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required maxLength={120} /></div>
            <div className="field"><label htmlFor="g-desc">Descrição</label><textarea id="g-desc" className="input" rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} maxLength={400} /></div>
            <ImageField label="Imagem" value={draft.imageUrl} onChange={(u) => setDraft({ ...draft, imageUrl: u })} />
            <div className="field">
              <label htmlFor="g-val">Valor (R$)</label>
              <input id="g-val" className="input" inputMode="decimal" disabled={draft.free} value={draft.free ? "" : draft.amountText} onChange={(e) => setDraft({ ...draft, amountText: e.target.value })} placeholder="150,00" />
              <label className="mt-2 flex cursor-pointer items-center gap-2 !normal-case !tracking-normal">
                <input type="checkbox" checked={draft.free} onChange={(e) => setDraft({ ...draft, free: e.target.checked })} /> Valor livre (o convidado digita)
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="field"><label htmlFor="g-ord">Ordem</label><input id="g-ord" className="input" inputMode="numeric" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value.replace(/\D/g, "") })} /></div>
              <div className="field"><label>Status</label>
                <label className="flex min-h-[3.25rem] cursor-pointer items-center gap-2 !normal-case !tracking-normal"><input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> Ativo no site</label>
              </div>
            </div>
            {error && <p className="err" role="alert">{error}</p>}
            <div className="flex gap-3">
              <button type="button" className="btn btn-ghost flex-1" onClick={() => setDraft(null)}>Cancelar</button>
              <button className="btn btn-solid flex-1" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
