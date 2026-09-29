import { query } from "@/server/db";
import type { Gift } from "@/lib/types";
import GiftManager from "@/components/admin/GiftManager";

export default async function Page() {
  const gifts = await query<Gift>("SELECT * FROM gifts ORDER BY sort_order, id");
  return (
    <div className="space-y-6">
      <h1 className="h-display text-4xl">Lista de presentes</h1>
      <GiftManager gifts={gifts} />
    </div>
  );
}
