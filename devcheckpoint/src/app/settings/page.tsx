import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/components/settings/settings-form";
import { getSettings } from "@/lib/actions/settings";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <AppShell>
      <PageHeader title="Settings" description="Local model and product preferences." />
      <SettingsForm initial={settings} />
    </AppShell>
  );
}
