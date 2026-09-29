"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Rsvp } from "@/lib/types";
import { formatDateTimeBR } from "@/lib/format";

export default function GuestTable({ guests }: { guests: Rsvp[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "yes" | "no">("all");

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return guests.filter((g) => {
      if (filter === "yes" && !g.attending) return false;
      if (filter === "no" && g.attending) return false;
      if (!t) return true;
      return [g.name, g.phone, g.companions_names, g.notes].some((f) => f.toLowerCase().includes(t));
    });
  }, [guests, q, filter]);

  const people = list.filter((g) => g.attending).reduce((n, g) => n + 1 + g.companions_count, 0);

  async function remove(g: Rsvp) {
    if (!confirm(`Excluir a resposta de ${g.name}?`)) return;
    const r = await fetch(`/api/admin/rsvps/${g.id}`, { method: "DELETE" });
    if (r.ok) router.refresh();
    else alert("Não foi possível excluir.");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input className="input sm:max-w-xs" placeholder="Buscar por nome, telefone…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" />
        <select className="input sm:w-48" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} aria-label="Filtrar">
          <option value="all">Todos</option>
          <option value="yes">Confirmados</option>
          <option value="no">Não vão</option>
        </select>
        <a href="/api/admin/rsvps/export" className="btn btn-ghost btn-sm sm:ml-auto">Exportar CSV</a>
      </div>
      <p className="text-sm text-muted">{list.length} resposta(s) · {people} pessoa(s) confirmada(s) na lista filtrada</p>

      <div className="overflow-x-auto rounded-2xl border border-line bg-paper">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line text-[0.68rem] uppercase tracking-[0.18em] text-muted">
            <tr>
              <th className="p-3">Nome</th><th className="p-3">Telefone</th><th className="p-3">Presença</th>
              <th className="p-3">Acomp.</th><th className="p-3">Observação</th><th className="p-3">Data</th><th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted">Nenhum convidado encontrado.</td></tr>}
            {list.map((g) => (
              <tr key={g.id} className="align-top">
                <td className="p-3">{g.name}</td>
                <td className="p-3 whitespace-nowrap">{g.phone}</td>
                <td className="p-3">{g.attending ? <span className="text-sage">Confirmado</span> : <span className="text-[#b4483d]">Não vai</span>}</td>
                <td className="p-3">
                  {g.companions_count}
                  {g.companions_names && <span className="block whitespace-pre-line text-xs text-muted">{g.companions_names}</span>}
                </td>
                <td className="max-w-[16rem] p-3 text-muted">{g.notes || "—"}</td>
                <td className="p-3 whitespace-nowrap text-muted">{formatDateTimeBR(g.created_at)}</td>
                <td className="p-3"><button onClick={() => remove(g)} className="text-xs text-[#b4483d] hover:underline">Excluir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
