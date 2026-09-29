import { query } from "@/server/db";
import { guardAdmin } from "@/server/http";
import { formatDateTimeBR } from "@/lib/format";
import type { Rsvp } from "@/lib/types";

function cell(v: string | number): string {
  let s = String(v);
  // Evita injeção de fórmulas ao abrir no Excel/Sheets
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const denied = await guardAdmin();
  if (denied) return denied;
  const rows = await query<Rsvp>("SELECT * FROM rsvps ORDER BY created_at DESC");
  const head = ["Nome", "Telefone", "Presença", "Acompanhantes", "Nomes dos acompanhantes", "Observação", "Data"];
  const lines = rows.map((r) =>
    [
      r.name,
      r.phone,
      r.attending ? "Confirmado" : "Não vai",
      r.companions_count,
      r.companions_names,
      r.notes,
      formatDateTimeBR(r.created_at),
    ]
      .map(cell)
      .join(";"),
  );
  const csv = "﻿" + [head.map(cell).join(";"), ...lines].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="convidados.csv"',
      "Cache-Control": "no-store",
    },
  });
}
