"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GiftOrder, OrderStatus } from "@/lib/types";
import { formatBRL, formatDateTimeBR } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";

export default function OrderTable({ orders, initialFilter }: { orders: GiftOrder[]; initialFilter: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState(initialFilter);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return orders.filter(
      (o) => (filter === "all" || o.status === filter) && (!t || [o.guest_name, o.gift_name, o.message].some((f) => f.toLowerCase().includes(t))),
    );
  }, [orders, filter, q]);
  const sum = list.filter((o) => o.status === "confirmed").reduce((n, o) => n + o.amount_cents, 0);

  async function setStatus(o: GiftOrder, status: OrderStatus) {
    setBusy(o.id);
    const r = await fetch(`/api/admin/orders/${o.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setBusy(null);
    if (r.ok) router.refresh();
    else alert("Não foi possível atualizar.");
  }
  async function remove(o: GiftOrder) {
    if (!confirm("Excluir este registro definitivamente?")) return;
    const r = await fetch(`/api/admin/orders/${o.id}`, { method: "DELETE" });
    if (r.ok) router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input className="input sm:max-w-xs" placeholder="Buscar convidado, presente, mensagem…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" />
        <select className="input sm:w-64" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Status">
          <option value="all">Todos os status</option>
          <option value="reported">Convidado diz que pagou</option>
          <option value="pending">Aguardando pagamento</option>
          <option value="confirmed">Confirmados</option>
          <option value="cancelled">Cancelados</option>
        </select>
      </div>
      <p className="text-sm text-muted">{list.length} registro(s) · {formatBRL(sum)} confirmados na lista filtrada</p>

      <div className="overflow-x-auto rounded-2xl border border-line bg-paper">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-line text-[0.68rem] uppercase tracking-[0.18em] text-muted">
            <tr><th className="p-3">Convidado</th><th className="p-3">Presente</th><th className="p-3">Valor</th><th className="p-3">Mensagem</th><th className="p-3">Data</th><th className="p-3">Status</th><th className="p-3" /></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted">Nada por aqui ainda.</td></tr>}
            {list.map((o) => (
              <tr key={o.id} className="align-top">
                <td className="p-3">{o.guest_name || <span className="text-muted">Anônimo</span>}</td>
                <td className="p-3">{o.gift_name}</td>
                <td className="p-3 whitespace-nowrap">{formatBRL(o.amount_cents)}</td>
                <td className="max-w-[16rem] p-3 text-muted">{o.message || "—"}</td>
                <td className="p-3 whitespace-nowrap text-muted">{formatDateTimeBR(o.created_at)}</td>
                <td className="p-3"><StatusBadge status={o.status} /></td>
                <td className="space-x-3 p-3 whitespace-nowrap text-xs">
                  {o.status !== "confirmed" && <button disabled={busy === o.id} onClick={() => setStatus(o, "confirmed")} className="text-sage hover:underline">Confirmar</button>}
                  {o.status === "confirmed" && <button disabled={busy === o.id} onClick={() => setStatus(o, "pending")} className="text-muted hover:underline">Desfazer</button>}
                  {o.status !== "cancelled" && o.status !== "confirmed" && <button disabled={busy === o.id} onClick={() => setStatus(o, "cancelled")} className="text-muted hover:underline">Cancelar</button>}
                  <button onClick={() => remove(o)} className="text-[#b4483d] hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
