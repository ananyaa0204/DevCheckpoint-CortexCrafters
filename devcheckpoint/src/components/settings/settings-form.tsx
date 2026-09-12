"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, PlugZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateSettings } from "@/lib/actions/settings";
import { testOllamaConnection, type OllamaConnectionStatus } from "@/lib/actions/ai";
import type { SettingsKey } from "@/lib/settings-defaults";
import { IGNORED_DIRECTORY_SEGMENTS } from "@/lib/security/patterns";

export function SettingsForm({ initial }: { initial: Record<SettingsKey, string> }) {
  const [endpoint, setEndpoint] = useState(initial.ollama_endpoint);
  const [model, setModel] = useState(initial.ollama_model);
  const [redactionEnabled, setRedactionEnabled] = useState(
    initial.secret_redaction_enabled === "true"
  );
  const [isPending, startTransition] = useTransition();
  const [connectionStatus, setConnectionStatus] = useState<OllamaConnectionStatus | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  function handleSave() {
    startTransition(async () => {
      try {
        await updateSettings({
          ollama_endpoint: endpoint.trim(),
          ollama_model: model.trim(),
          secret_redaction_enabled: String(redactionEnabled),
        });
        toast.success("Settings saved");
      } catch {
        toast.error("Could not save settings.");
      }
    });
  }

  async function handleTestConnection() {
    setIsTesting(true);
    setConnectionStatus(null);
    try {
      const status = await testOllamaConnection(endpoint.trim(), model.trim());
      setConnectionStatus(status);
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-1 p-5">
        <h2 className="text-sm font-semibold">Local AI</h2>
        <p className="text-xs text-text-muted">
          DevCheckpoint only uses a local Ollama model. There is no cloud AI fallback.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ollama-endpoint">Ollama Endpoint</Label>
          <Input id="ollama-endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ollama-model">Qwen Model</Label>
          <Input id="ollama-model" value={model} onChange={(e) => setModel(e.target.value)} />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleTestConnection} disabled={isTesting}>
            {isTesting ? <Loader2 className="animate-spin" /> : <PlugZap />}
            Test Connection
          </Button>
          {connectionStatus?.connected && connectionStatus.modelAvailable && (
            <span className="flex items-center gap-1.5 text-xs text-success">
              <CheckCircle2 className="size-3.5" /> Connected · model ready
            </span>
          )}
          {connectionStatus?.connected && !connectionStatus.modelAvailable && (
            <span className="flex items-center gap-1.5 text-xs text-warning">
              <AlertTriangle className="size-3.5" /> Connected, but &quot;{model}&quot; isn&apos;t pulled yet
            </span>
          )}
          {connectionStatus && !connectionStatus.connected && (
            <span className="flex items-center gap-1.5 text-xs text-danger">
              <XCircle className="size-3.5" /> {connectionStatus.error}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-1 p-5">
        <h2 className="text-sm font-semibold">Privacy</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Secret Redaction</p>
            <p className="text-xs text-text-muted">
              Redact likely secrets (API keys, tokens, passwords) before saving or sending context.
            </p>
          </div>
          <Switch checked={redactionEnabled} onCheckedChange={setRedactionEnabled} />
        </div>
        <div>
          <p className="mb-1.5 text-sm text-foreground">Repository Exclusions</p>
          <p className="mb-2 text-xs text-text-muted">
            .env files, keys, credentials, and SSH/AWS/GPG folders are never read. These
            directories are always ignored:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[...IGNORED_DIRECTORY_SEGMENTS].map((dir) => (
              <span
                key={dir}
                className="rounded-full border border-border bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-text-secondary"
              >
                {dir}
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-text-muted">
          All AI inference runs locally through Ollama. Your code and checkpoints never leave
          this machine.
        </p>
      </div>

      <div className="lg:col-span-2">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : null}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
