import { query } from "@/server/db";
import type { Rsvp } from "@/lib/types";
import GuestTable from "@/components/admin/GuestTable";

export default async function Page() {
  const rows = await query<Rsvp>("SELECT * FROM rsvps ORDER BY created_at DESC");
  const guests = rows.map((r) => ({ ...r, created_at: new Date(r.created_at).toISOString() }));
  return (
    <div className="space-y-6">
      <h1 className="h-display text-4xl">Convidados</h1>
      <GuestTable guests={guests} />
    </div>
  );
}
