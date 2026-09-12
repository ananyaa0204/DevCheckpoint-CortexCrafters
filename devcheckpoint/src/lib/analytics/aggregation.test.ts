import { describe, expect, it } from "vitest";
import {
  bucketCheckpointActivity,
  buildContextFreshness,
  computeAiHealth,
  computeContextStats,
  computeTaskStatusCounts,
  getRangeStart,
  rankProjectActivity,
} from "@/lib/analytics/aggregation";

const NOW = new Date("2026-09-12T12:00:00.000Z");

describe("zero-data analytics", () => {
  it("produces safe, non-crashing results with no data at all", () => {
    expect(computeAiHealth([])).toEqual({
      attempts: 0,
      completed: 0,
      failed: 0,
      pending: 0,
      skipped: 0,
      successRate: null,
      hasData: false,
    });
    expect(computeContextStats([], 0)).toEqual({
      totalRecords: 0,
      uniqueFiles: 0,
      avgFilesPerCheckpoint: 0,
      topFiles: [],
    });
    expect(rankProjectActivity([])).toEqual([]);
    expect(buildContextFreshness([])).toEqual({
      lastCheckpointAt: null,
      checkpointsToday: 0,
      checkpointsThisWeek: 0,
    });
    const buckets = bucketCheckpointActivity([], "7d", NOW);
    expect(buckets).toHaveLength(7);
    expect(buckets.every((b) => b.count === 0)).toBe(true);
    expect(bucketCheckpointActivity([], "all", NOW)).toEqual([]);
  });
});

describe("computeTaskStatusCounts", () => {
  it("maps ACTIVE / PAUSED / COMPLETED groups correctly", () => {
    const result = computeTaskStatusCounts([
      { status: "ACTIVE", count: 4 },
      { status: "PAUSED", count: 2 },
      { status: "COMPLETED", count: 11 },
    ]);
    expect(result).toEqual({ active: 4, paused: 2, completed: 11 });
  });

  it("defaults missing statuses to zero", () => {
    expect(computeTaskStatusCounts([{ status: "ACTIVE", count: 3 }])).toEqual({
      active: 3,
      paused: 0,
      completed: 0,
    });
  });

  it("ignores unknown status values instead of crashing", () => {
    expect(computeTaskStatusCounts([{ status: "ARCHIVED", count: 5 }])).toEqual({
      active: 0,
      paused: 0,
      completed: 0,
    });
  });
});

describe("bucketCheckpointActivity — checkpoint date grouping", () => {
  it("groups by calendar day for a 7-day range and keeps zero-count days", () => {
    const dates = [
      new Date("2026-09-12T09:00:00.000Z"),
      new Date("2026-09-12T18:00:00.000Z"), // same day, should combine
      new Date("2026-09-10T09:00:00.000Z"),
    ];
    const buckets = bucketCheckpointActivity(dates, "7d", NOW);
    expect(buckets).toHaveLength(7);
    expect(buckets[buckets.length - 1].count).toBe(2); // today
    const total = buckets.reduce((sum, b) => sum + b.count, 0);
    expect(total).toBe(3);
  });

  it("Last 7 Days filtering: excludes dates before the window", () => {
    const dates = [new Date("2026-08-01T00:00:00.000Z")]; // well before the 7-day window
    const buckets = bucketCheckpointActivity(dates, "7d", NOW);
    expect(buckets.reduce((sum, b) => sum + b.count, 0)).toBe(0);
  });

  it("Last 30 Days filtering: produces 30 buckets and counts within range", () => {
    const dates = [new Date("2026-08-20T00:00:00.000Z"), new Date("2026-09-12T00:00:00.000Z")];
    const buckets = bucketCheckpointActivity(dates, "30d", NOW);
    expect(buckets).toHaveLength(30);
    expect(buckets.reduce((sum, b) => sum + b.count, 0)).toBe(2);
  });

  it("does not produce NaN or crash with a single datapoint", () => {
    const buckets = bucketCheckpointActivity([new Date("2026-09-12T00:00:00.000Z")], "7d", NOW);
    expect(buckets.every((b) => Number.isFinite(b.count))).toBe(true);
  });

  it("all time: groups by day for a short span", () => {
    const dates = [new Date("2026-09-01T00:00:00.000Z"), new Date("2026-09-10T00:00:00.000Z")];
    const buckets = bucketCheckpointActivity(dates, "all", NOW);
    expect(buckets.length).toBeGreaterThan(0);
    expect(buckets.length).toBeLessThan(20);
  });

  it("all time: groups by month for a long span and never produces hundreds of labels", () => {
    const dates = [new Date("2024-01-15T00:00:00.000Z"), new Date("2026-09-01T00:00:00.000Z")];
    const buckets = bucketCheckpointActivity(dates, "all", NOW);
    expect(buckets.length).toBeLessThan(40);
  });
});

describe("getRangeStart", () => {
  it("returns null for all time", () => {
    expect(getRangeStart("all", NOW)).toBeNull();
  });

  it("returns a start date 6 days before today for 7d (inclusive)", () => {
    const start = getRangeStart("7d", NOW)!;
    expect(start.toISOString().slice(0, 10)).toBe("2026-09-06");
  });

  it("returns a start date 29 days before today for 30d (inclusive)", () => {
    const start = getRangeStart("30d", NOW)!;
    expect(start.toISOString().slice(0, 10)).toBe("2026-08-14");
  });
});

describe("rankProjectActivity — project activity ranking", () => {
  it("ranks projects by checkpoint count, descending", () => {
    const items = [
      ...Array(18).fill({ projectId: "p1", projectName: "EduLedger" }),
      ...Array(12).fill({ projectId: "p2", projectName: "OneWave" }),
      ...Array(9).fill({ projectId: "p3", projectName: "DevCheckpoint" }),
    ];
    const ranked = rankProjectActivity(items);
    expect(ranked.map((r) => r.projectName)).toEqual(["EduLedger", "OneWave", "DevCheckpoint"]);
    expect(ranked[0].count).toBe(18);
  });

  it("shows a single project when only one exists", () => {
    const ranked = rankProjectActivity([{ projectId: "p1", projectName: "Solo" }]);
    expect(ranked).toEqual([{ projectId: "p1", projectName: "Solo", count: 1 }]);
  });

  it("limits to the top N", () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      projectId: `p${i}`,
      projectName: `Project ${i}`,
    }));
    expect(rankProjectActivity(items, 5)).toHaveLength(5);
  });

  it("project filter: pre-scoped input only reflects that project", () => {
    const scoped = [
      { projectId: "p1", projectName: "EduLedger" },
      { projectId: "p1", projectName: "EduLedger" },
    ];
    const ranked = rankProjectActivity(scoped);
    expect(ranked).toEqual([{ projectId: "p1", projectName: "EduLedger", count: 2 }]);
  });
});

describe("computeAiHealth — AI health calculations", () => {
  it("computes attempts, success rate, and keeps skipped separate", () => {
    const statuses = [
      "COMPLETED",
      "COMPLETED",
      "COMPLETED",
      "COMPLETED",
      "FAILED",
      "PENDING",
      "SKIPPED",
      "SKIPPED",
    ];
    const health = computeAiHealth(statuses);
    expect(health.completed).toBe(4);
    expect(health.failed).toBe(1);
    expect(health.pending).toBe(1);
    expect(health.skipped).toBe(2);
    expect(health.attempts).toBe(6); // excludes skipped
    expect(health.successRate).toBeCloseTo(66.7, 1);
    expect(health.hasData).toBe(true);
  });

  it("AI health zero denominator: all skipped never produces NaN/Infinity", () => {
    const health = computeAiHealth(["SKIPPED", "SKIPPED", "SKIPPED"]);
    expect(health.attempts).toBe(0);
    expect(health.successRate).toBeNull();
    expect(health.hasData).toBe(true);
    expect(Number.isNaN(health.successRate)).toBe(false);
  });

  it("reports no data when there are no checkpoints at all", () => {
    expect(computeAiHealth([]).hasData).toBe(false);
  });
});

describe("computeContextStats", () => {
  it("frequent-file ranking: orders by distinct-checkpoint frequency", () => {
    const files = [
      ...Array(8).fill(null).map((_, i) => ({ filePath: "src/auth.ts", checkpointId: `c${i}` })),
      ...Array(6).fill(null).map((_, i) => ({ filePath: "src/middleware.ts", checkpointId: `c${i}` })),
      ...Array(5).fill(null).map((_, i) => ({ filePath: "package.json", checkpointId: `c${i}` })),
    ];
    const stats = computeContextStats(files, 20);
    expect(stats.topFiles[0]).toEqual({ path: "src/auth.ts", count: 8 });
    expect(stats.topFiles[1].path).toBe("src/middleware.ts");
  });

  it("unique-file count: does not double count a file appearing in one checkpoint twice", () => {
    const files = [
      { filePath: "a.ts", checkpointId: "c1" },
      { filePath: "a.ts", checkpointId: "c1" }, // duplicate in same checkpoint
      { filePath: "b.ts", checkpointId: "c1" },
    ];
    const stats = computeContextStats(files, 1);
    expect(stats.uniqueFiles).toBe(2);
  });

  it("average files/checkpoint: divides safely and guards against zero checkpoints", () => {
    const files = [
      { filePath: "a.ts", checkpointId: "c1" },
      { filePath: "b.ts", checkpointId: "c1" },
      { filePath: "c.ts", checkpointId: "c2" },
    ];
    expect(computeContextStats(files, 2).avgFilesPerCheckpoint).toBe(1.5);
    const zeroCheckpoints = computeContextStats(files, 0);
    expect(zeroCheckpoints.avgFilesPerCheckpoint).toBe(0);
    expect(Number.isFinite(zeroCheckpoints.avgFilesPerCheckpoint)).toBe(true);
  });
});

describe("buildContextFreshness", () => {
  it("context freshness with no checkpoints", () => {
    expect(buildContextFreshness([], NOW)).toEqual({
      lastCheckpointAt: null,
      checkpointsToday: 0,
      checkpointsThisWeek: 0,
    });
  });

  it("context freshness with checkpoints: finds the latest and counts windows", () => {
    const dates = [
      new Date("2026-09-12T08:00:00.000Z"), // today
      new Date("2026-09-08T08:00:00.000Z"), // this week
      new Date("2026-01-01T08:00:00.000Z"), // old
    ];
    const freshness = buildContextFreshness(dates, NOW);
    expect(freshness.lastCheckpointAt).toEqual(dates[0]);
    expect(freshness.checkpointsToday).toBe(1);
    expect(freshness.checkpointsThisWeek).toBe(2);
  });
});
