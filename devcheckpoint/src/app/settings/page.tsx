import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/components/settings/settings-form";
import { getSettings } from "@/lib/actions/settings";
import { getSystemInfo } from "@/lib/actions/system-info";

export default async function SettingsPage() {
  const [settings, systemInfo] = await Promise.all([getSettings(), getSystemInfo()]);

  return (
    <AppShell>
      <PageHeader title="Settings" description="Local model and product preferences." />
      <div className="flex flex-col gap-4">
        <SettingsForm initial={settings} />

        <div className="rounded-lg border border-border bg-surface-1 p-5">
          <h2 className="mb-3 text-sm font-semibold">Developer</h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-text-muted">Application data path</span>
              <span className="truncate font-mono text-xs text-text-secondary">
                {systemInfo.appDataDir}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-text-muted">Version</span>
              <span className="font-mono text-xs text-text-secondary">{systemInfo.version}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-text-muted">Platform</span>
              <span className="font-mono text-xs text-text-secondary">{systemInfo.platform}</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
