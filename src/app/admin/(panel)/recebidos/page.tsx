import { query } from "@/server/db";
import type { GiftOrder } from "@/lib/types";
import OrderTable from "@/components/admin/OrderTable";

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const rows = await query<GiftOrder>("SELECT * FROM gift_orders ORDER BY created_at DESC LIMIT 1000");
  const orders = rows.map((r) => ({
    ...r,
    created_at: new Date(r.created_at).toISOString(),
    confirmed_at: r.confirmed_at ? new Date(r.confirmed_at).toISOString() : null,
  }));
  return (
    <div className="space-y-6">
      <h1 className="h-display text-4xl">Presentes recebidos</h1>
      <p className="max-w-2xl text-sm text-muted">
        Sem integração bancária, o sistema não sabe quando um Pix caiu na sua conta. Confira o extrato e marque como
        <strong className="font-normal text-ink"> confirmado </strong>
        os pagamentos recebidos. Somente pagamentos confirmados entram nos totais do dashboard.
      </p>
      <OrderTable orders={orders} initialFilter={status ?? "all"} />
    </div>
  );
}
