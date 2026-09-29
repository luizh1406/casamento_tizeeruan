import { query } from "@/server/db";
import { formatBRL, formatDateTimeBR } from "@/lib/format";
import type { GiftOrder, Rsvp } from "@/lib/types";
import { StatusBadge } from "@/components/admin/StatusBadge";
import Link from "next/link";

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-5">
      <p className="label !mb-2">{label}</p>
      <p className="h-display text-4xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default async function Dashboard() {
  const [[r], [o], lastOrders, lastRsvps] = await Promise.all([
    query<{ confirmed: number; companions: number; declined: number }>(
      `SELECT COUNT(*) FILTER (WHERE attending)::int AS confirmed,
              COALESCE(SUM(companions_count) FILTER (WHERE attending),0)::int AS companions,
              COUNT(*) FILTER (WHERE NOT attending)::int AS declined FROM rsvps`,
    ),
    query<{ received: number; total: number; pending: number; pending_total: number }>(
      `SELECT COUNT(*) FILTER (WHERE status='confirmed')::int AS received,
              COALESCE(SUM(amount_cents) FILTER (WHERE status='confirmed'),0)::float8 AS total,
              COUNT(*) FILTER (WHERE status='reported')::int AS pending,
              COALESCE(SUM(amount_cents) FILTER (WHERE status='reported'),0)::float8 AS pending_total FROM gift_orders`,
    ),
    query<GiftOrder>("SELECT * FROM gift_orders WHERE status <> 'cancelled' ORDER BY created_at DESC LIMIT 6"),
    query<Rsvp>("SELECT * FROM rsvps ORDER BY updated_at DESC LIMIT 6"),
  ]);

  return (
    <div className="space-y-10">
      <h1 className="h-display text-4xl">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Convidados confirmados" value={r.confirmed} hint={`${r.declined} não poderão ir`} />
        <Stat label="Acompanhantes" value={r.companions} hint={`${r.confirmed + r.companions} pessoas no total`} />
        <Stat label="Presentes recebidos" value={o.received} hint="pagamentos confirmados" />
        <Stat label="Valor total recebido" value={formatBRL(o.total)} />
      </div>

      {o.pending > 0 && (
        <Link href="/admin/recebidos?status=reported" className="block rounded-2xl border border-gold/50 bg-blush/60 p-5 text-sm">
          <strong className="font-normal text-gold-dark">{o.pending} presente(s)</strong> ({formatBRL(o.pending_total)}) informado(s) como pago(s) pelos convidados aguardando a sua confirmação. Confira no extrato do banco e confirme →
        </Link>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="h-display mb-3 text-2xl">Últimos presentes</h2>
          <div className="divide-y divide-line rounded-2xl border border-line bg-paper">
            {lastOrders.length === 0 && <p className="p-5 text-sm text-muted">Nenhum presente ainda.</p>}
            {lastOrders.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                <div className="min-w-0">
                  <p className="truncate">{g.guest_name || "Anônimo"} · {g.gift_name}</p>
                  <p className="text-xs text-muted">{formatDateTimeBR(g.created_at)}</p>
                </div>
                <div className="text-right">
                  <p>{formatBRL(g.amount_cents)}</p>
                  <StatusBadge status={g.status} />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="h-display mb-3 text-2xl">Últimas confirmações</h2>
          <div className="divide-y divide-line rounded-2xl border border-line bg-paper">
            {lastRsvps.length === 0 && <p className="p-5 text-sm text-muted">Nenhuma resposta ainda.</p>}
            {lastRsvps.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                <div className="min-w-0">
                  <p className="truncate">{g.name}</p>
                  <p className="text-xs text-muted">{formatDateTimeBR(g.created_at)}</p>
                </div>
                <div className="text-right text-xs">
                  {g.attending ? <span className="text-sage">Vai · +{g.companions_count}</span> : <span className="text-[#b4483d]">Não vai</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
