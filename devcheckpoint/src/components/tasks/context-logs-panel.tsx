"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Terminal, AlertOctagon, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  addCommandLog,
  addErrorLog,
  deleteCommandLog,
  deleteErrorLog,
} from "@/lib/actions/context-logs";
import { formatRelativeTime } from "@/lib/utils";

type CommandLogItem = { id: string; command: string; exitStatus: number | null; createdAt: string | Date };
type ErrorLogItem = { id: string; message: string; source: string | null; createdAt: string | Date };

export function ContextLogsPanel({
  taskId,
  initialCommands,
  initialErrors,
}: {
  taskId: string;
  initialCommands: CommandLogItem[];
  initialErrors: ErrorLogItem[];
}) {
  const [commands, setCommands] = useState(initialCommands);
  const [errors, setErrors] = useState(initialErrors);
  const [commandText, setCommandText] = useState("");
  const [exitStatus, setExitStatus] = useState("");
  const [errorText, setErrorText] = useState("");
  const [errorSource, setErrorSource] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAddCommand() {
    if (!commandText.trim()) return;
    startTransition(async () => {
      const parsedExit = exitStatus.trim() ? Number(exitStatus.trim()) : undefined;
      const created = await addCommandLog({
        taskId,
        command: commandText,
        exitStatus: Number.isFinite(parsedExit) ? parsedExit : undefined,
      });
      setCommands((prev) => [created, ...prev]);
      setCommandText("");
      setExitStatus("");
      toast.success("Command saved");
    });
  }

  function handleAddError() {
    if (!errorText.trim()) return;
    startTransition(async () => {
      const created = await addErrorLog({ taskId, message: errorText, source: errorSource });
      setErrors((prev) => [created, ...prev]);
      setErrorText("");
      setErrorSource("");
      toast.success("Error saved");
    });
  }

  async function handleDeleteCommand(id: string) {
    if (!window.confirm("Delete this saved command?")) return;
    setCommands((prev) => prev.filter((c) => c.id !== id));
    await deleteCommandLog(id);
  }

  async function handleDeleteError(id: string) {
    if (!window.confirm("Delete this saved error?")) return;
    setErrors((prev) => prev.filter((e) => e.id !== id));
    await deleteErrorLog(id);
  }

  return (
    <div className="rounded-lg border border-border bg-surface-1 p-4">
      <h2 className="mb-3 text-sm font-semibold">Commands &amp; Errors</h2>
      <Tabs defaultValue="commands">
        <TabsList className="mb-3">
          <TabsTrigger value="commands">
            <Terminal className="size-3.5" /> Commands ({commands.length})
          </TabsTrigger>
          <TabsTrigger value="errors">
            <AlertOctagon className="size-3.5" /> Errors ({errors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commands" className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Textarea
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              placeholder="Paste a command you ran, e.g. pnpm test"
              rows={2}
              className="flex-1 font-mono text-xs"
            />
            <div className="flex gap-2 sm:flex-col">
              <Input
                value={exitStatus}
                onChange={(e) => setExitStatus(e.target.value)}
                placeholder="Exit code"
                className="w-28"
              />
              <Button size="sm" onClick={handleAddCommand} disabled={isPending}>
                {isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                Add
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {commands.length === 0 ? (
              <p className="text-xs text-text-muted">No commands recorded for this task yet.</p>
            ) : (
              commands.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start justify-between gap-2 rounded-md border border-border-subtle bg-surface-2 p-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-text-secondary">{c.command}</p>
                    <p className="text-[11px] text-text-muted">
                      {c.exitStatus !== null ? `exit ${c.exitStatus} · ` : ""}
                      {formatRelativeTime(c.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCommand(c.id)}
                    className="text-text-muted hover:text-danger"
                    aria-label="Delete command"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="errors" className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Textarea
              value={errorText}
              onChange={(e) => setErrorText(e.target.value)}
              placeholder="Paste an error message or traceback"
              rows={2}
              className="flex-1 font-mono text-xs"
            />
            <div className="flex gap-2 sm:flex-col">
              <Input
                value={errorSource}
                onChange={(e) => setErrorSource(e.target.value)}
                placeholder="Source"
                className="w-28"
              />
              <Button size="sm" onClick={handleAddError} disabled={isPending}>
                {isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                Add
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {errors.length === 0 ? (
              <p className="text-xs text-text-muted">No errors recorded for this task yet.</p>
            ) : (
              errors.map((e) => (
                <div
                  key={e.id}
                  className="flex items-start justify-between gap-2 rounded-md border border-border-subtle bg-surface-2 p-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-text-secondary">{e.message}</p>
                    <p className="text-[11px] text-text-muted">
                      {e.source ? `${e.source} · ` : ""}
                      {formatRelativeTime(e.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteError(e.id)}
                    className="text-text-muted hover:text-danger"
                    aria-label="Delete error"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
