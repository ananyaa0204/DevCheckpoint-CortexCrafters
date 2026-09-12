import { describe, expect, it } from "vitest";
import { buildContextSnapshot } from "@/lib/context/snapshot";

describe("buildContextSnapshot", () => {
  it("copies every field verbatim without inventing anything", () => {
    const snapshot = buildContextSnapshot({
      taskTitle: "Fix Stripe webhook verification",
      taskDescription: "Investigate signature failures",
      branch: "feature/stripe-webhook",
      developerNote: "Still failing after updating the secret.",
      files: [{ path: "src/api/webhook.ts", changeType: "modified", staged: false, insertions: 3, deletions: 1 }],
      commits: [{ hash: "abc1234", message: "add webhook endpoint", authorName: "dev", date: "2026-01-01" }],
      diffTruncated: false,
    });

    expect(snapshot.schemaVersion).toBe(1);
    expect(snapshot.task).toEqual({
      title: "Fix Stripe webhook verification",
      description: "Investigate signature failures",
    });
    expect(snapshot.branch).toBe("feature/stripe-webhook");
    expect(snapshot.developerNote).toBe("Still failing after updating the secret.");
    expect(snapshot.changedFiles).toEqual([{ path: "src/api/webhook.ts", changeType: "modified" }]);
    expect(snapshot.commits).toEqual([{ hash: "abc1234", message: "add webhook endpoint" }]);
    expect(snapshot.diffTruncated).toBe(false);
    expect(typeof snapshot.generatedAt).toBe("string");
  });

  it("preserves a null developer note and empty collections", () => {
    const snapshot = buildContextSnapshot({
      taskTitle: "Task",
      taskDescription: null,
      branch: null,
      developerNote: null,
      files: [],
      commits: [],
      diffTruncated: true,
    });

    expect(snapshot.developerNote).toBeNull();
    expect(snapshot.branch).toBeNull();
    expect(snapshot.changedFiles).toEqual([]);
    expect(snapshot.commits).toEqual([]);
    expect(snapshot.diffTruncated).toBe(true);
  });
});
