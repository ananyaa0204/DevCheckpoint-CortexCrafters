import { parseUnifiedDiff } from "@/lib/git/diff-utils";
import { cn } from "@/lib/utils";

export function CodeDiff({ diff }: { diff: string }) {
  const lines = parseUnifiedDiff(diff);

  if (lines.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-text-muted">
        No diff to display.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-[#080D13] font-mono text-[12.5px] leading-[1.5]">
      {lines.map((line, i) => {
        if (line.type === "meta") return null;
        if (line.type === "hunk") {
          return (
            <div key={i} className="whitespace-pre px-3 py-1 text-text-muted">
              {line.content}
            </div>
          );
        }
        return (
          <div
            key={i}
            className={cn(
              "flex whitespace-pre px-3",
              line.type === "add" && "bg-[rgba(34,197,94,0.14)] text-[#4ADE80]",
              line.type === "remove" && "bg-[rgba(239,68,68,0.15)] text-[#F87171]",
              line.type === "context" && "text-text-secondary"
            )}
          >
            <span className="mr-2 select-none text-text-disabled">
              {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
            </span>
            {line.content}
          </div>
        );
      })}
    </div>
  );
}
