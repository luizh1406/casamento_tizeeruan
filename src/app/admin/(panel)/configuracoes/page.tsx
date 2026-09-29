import { getSettings } from "@/server/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function Page() {
  const settings = await getSettings();
  return (
    <div className="space-y-6">
      <h1 className="h-display text-4xl">Configurações</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
