"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateSettings } from "@/lib/actions/settings";
import type { SettingsKey } from "@/lib/settings-defaults";

export function SettingsForm({ initial }: { initial: Record<SettingsKey, string> }) {
  const [endpoint, setEndpoint] = useState(initial.ollama_endpoint);
  const [model, setModel] = useState(initial.ollama_model);
  const [redactionEnabled, setRedactionEnabled] = useState(
    initial.secret_redaction_enabled === "true"
  );
  const [isPending, startTransition] = useTransition();

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

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-1 p-5">
        <h2 className="text-sm font-semibold">Local AI</h2>
        <p className="text-xs text-text-muted">
          Ollama/Qwen inference is not wired up yet — these values are stored for when it is.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ollama-endpoint">Ollama Endpoint</Label>
          <Input id="ollama-endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ollama-model">Qwen Model</Label>
          <Input id="ollama-model" value={model} onChange={(e) => setModel(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-1 p-5">
        <h2 className="text-sm font-semibold">Security &amp; Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Secret Redaction</p>
            <p className="text-xs text-text-muted">Redact likely secrets before any future AI request.</p>
          </div>
          <Switch checked={redactionEnabled} onCheckedChange={setRedactionEnabled} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Theme</p>
            <p className="text-xs text-text-muted">DevCheckpoint is dark-only for now.</p>
          </div>
          <span className="text-sm text-text-secondary">Dark</span>
        </div>
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
