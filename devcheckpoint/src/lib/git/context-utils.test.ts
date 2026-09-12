import { describe, expect, it } from "vitest";
import { mapChangeType, prioritizeAndTruncateFiles, truncateDiff } from "@/lib/git/context-utils";
import type { ChangedFileInfo } from "@/lib/git/types";

describe("mapChangeType", () => {
  it("maps staged/unstaged status letters correctly", () => {
    expect(mapChangeType("M", " ")).toBe("modified");
    expect(mapChangeType(" ", "M")).toBe("modified");
    expect(mapChangeType("A", " ")).toBe("added");
    expect(mapChangeType("D", " ")).toBe("deleted");
    expect(mapChangeType("R", " ")).toBe("renamed");
    expect(mapChangeType("?", "?")).toBe("untracked");
  });

  it("falls back to modified for unknown codes", () => {
    expect(mapChangeType("X", "X")).toBe("modified");
  });
});

function file(path: string, staged: boolean): ChangedFileInfo {
  return { path, changeType: "modified", staged, insertions: 0, deletions: 0 };
}

describe("prioritizeAndTruncateFiles", () => {
  it("keeps all files and reports no truncation when under the limit", () => {
    const files = [file("a.ts", false), file("b.ts", true)];
    const result = prioritizeAndTruncateFiles(files, 10);
    expect(result.truncated).toBe(false);
    expect(result.total).toBe(2);
    expect(result.files).toHaveLength(2);
  });

  it("puts staged files first", () => {
    const files = [file("unstaged.ts", false), file("staged.ts", true)];
    const result = prioritizeAndTruncateFiles(files, 10);
    expect(result.files[0].path).toBe("staged.ts");
    expect(result.files[1].path).toBe("unstaged.ts");
  });

  it("truncates to maxFiles and reports the true total", () => {
    const files = Array.from({ length: 250 }, (_, i) => file(`file-${i}.ts`, false));
    const result = prioritizeAndTruncateFiles(files, 200);
    expect(result.truncated).toBe(true);
    expect(result.total).toBe(250);
    expect(result.files).toHaveLength(200);
  });

  it("prioritizes staged files ahead of truncation", () => {
    const files = [
      ...Array.from({ length: 199 }, (_, i) => file(`unstaged-${i}.ts`, false)),
      file("important-staged.ts", true),
    ];
    const result = prioritizeAndTruncateFiles(files, 199);
    expect(result.files.map((f) => f.path)).toContain("important-staged.ts");
  });
});

describe("truncateDiff", () => {
  it("returns the diff unchanged when under the limit", () => {
    const result = truncateDiff("short diff", 100);
    expect(result.truncated).toBe(false);
    expect(result.diff).toBe("short diff");
  });

  it("truncates and flags long diffs", () => {
    const long = "x".repeat(500);
    const result = truncateDiff(long, 100);
    expect(result.truncated).toBe(true);
    expect(result.diff).toHaveLength(100);
  });
});
