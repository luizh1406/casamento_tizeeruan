const MAP: Record<string, [string, string]> = {
  pending: ["Aguardando pagamento", "bg-sand text-muted"],
  reported: ["Convidado diz que pagou", "bg-[#f5e6c8] text-[#8a6320]"],
  confirmed: ["Confirmado", "bg-[#dfe8da] text-[#41603a]"],
  cancelled: ["Cancelado", "bg-[#f1dad6] text-[#8e3b31]"],
};

export function StatusBadge({ status }: { status: string }) {
  const [label, cls] = MAP[status] ?? [status, "bg-sand"];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[0.68rem] ${cls}`}>{label}</span>;
}
