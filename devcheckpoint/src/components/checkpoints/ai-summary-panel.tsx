import { AlertTriangle, ArrowRight, FileCode2, ListChecks, Code2 } from "lucide-react";
import type { CheckpointAiOutput } from "@/lib/ai/checkpoint-schema";

function Section({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: typeof AlertTriangle;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className={`size-4 ${accent}`} />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function AiSummaryPanel({ summary }: { summary: CheckpointAiOutput }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-purple/20 bg-purple/5 p-4">
      <p className="text-xs text-text-muted">
        AI-generated summary — inferred by the local Qwen model from the captured Git context and
        your note. Not written by a human.
      </p>

      {summary.changes.length > 0 && (
        <Section icon={Code2} title="What Changed" accent="text-cyan">
          <ul className="ml-5 list-disc text-sm text-text-secondary">
            {summary.changes.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Section>
      )}

      {summary.blocker && (
        <Section icon={AlertTriangle} title="Current Blocker" accent="text-danger">
          <p className="text-sm text-text-secondary">{summary.blocker}</p>
        </Section>
      )}

      {summary.attempts.length > 0 && (
        <Section icon={ListChecks} title="What You Already Tried" accent="text-info">
          <ul className="ml-5 list-disc text-sm text-text-secondary">
            {summary.attempts.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </Section>
      )}

      {summary.importantFiles.length > 0 && (
        <Section icon={FileCode2} title="Important Files" accent="text-purple">
          <div className="flex flex-wrap gap-1.5">
            {summary.importantFiles.map((f) => (
              <span
                key={f}
                className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-text-secondary"
              >
                {f}
              </span>
            ))}
          </div>
        </Section>
      )}

      {summary.nextStep && (
        <Section icon={ArrowRight} title="Next Recommended Step" accent="text-success">
          <p className="text-sm text-text-secondary">{summary.nextStep}</p>
        </Section>
      )}
    </div>
  );
}
