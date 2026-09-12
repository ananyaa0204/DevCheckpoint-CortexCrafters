import { describe, expect, it } from "vitest";
import { redactSecrets, sanitizeChangedFiles, sanitizeCheckpointContext } from "@/lib/security/sanitizer";
import { isExcludedPath, isSensitivePath, isIgnoredNoisePath } from "@/lib/security/patterns";

describe("isSensitivePath", () => {
  it("flags .env and its variants", () => {
    expect(isSensitivePath(".env")).toBe(true);
    expect(isSensitivePath(".env.local")).toBe(true);
    expect(isSensitivePath("packages/api/.env.production")).toBe(true);
  });

  it("flags key/credential files", () => {
    expect(isSensitivePath("server.pem")).toBe(true);
    expect(isSensitivePath("config/private.key")).toBe(true);
    expect(isSensitivePath("id_rsa")).toBe(true);
    expect(isSensitivePath("id_ed25519.pub")).toBe(true);
    expect(isSensitivePath("credentials.json")).toBe(true);
    expect(isSensitivePath("secrets.yaml")).toBe(true);
    expect(isSensitivePath(".ssh/config")).toBe(true);
  });

  it("does not flag ordinary source files", () => {
    expect(isSensitivePath("src/lib/git/git-client.ts")).toBe(false);
    expect(isSensitivePath("README.md")).toBe(false);
    expect(isSensitivePath(".env-example.md")).toBe(false);
  });
});

describe("isIgnoredNoisePath", () => {
  it("flags known noise directories at any depth", () => {
    expect(isIgnoredNoisePath("node_modules/foo/index.js")).toBe(true);
    expect(isIgnoredNoisePath("packages/app/dist/bundle.js")).toBe(true);
    expect(isIgnoredNoisePath("src-tauri/target/debug/app.exe")).toBe(true);
  });

  it("does not flag normal source paths", () => {
    expect(isIgnoredNoisePath("src/app/page.tsx")).toBe(false);
  });
});

describe("isExcludedPath", () => {
  it("combines sensitive and noise checks", () => {
    expect(isExcludedPath(".env")).toBe(true);
    expect(isExcludedPath("node_modules/x/y.js")).toBe(true);
    expect(isExcludedPath("src/index.ts")).toBe(false);
  });
});

describe("redactSecrets", () => {
  it("redacts KEY=VALUE style secrets while keeping the key name", () => {
    const { text, redactionCount } = redactSecrets('API_KEY=sk_live_abc123\nSTRIPE_SECRET_KEY="whsec_xyz"');
    expect(text).toContain("API_KEY=[REDACTED]");
    expect(text).toContain("STRIPE_SECRET_KEY=[REDACTED]");
    expect(text).not.toContain("sk_live_abc123");
    expect(text).not.toContain("whsec_xyz");
    expect(redactionCount).toBe(2);
  });

  it("redacts PASSWORD, TOKEN, DATABASE_URL, ACCESS_TOKEN, REFRESH_TOKEN", () => {
    const input = [
      "PASSWORD=hunter2",
      "ACCESS_TOKEN=abc.def.ghi",
      "REFRESH_TOKEN=zzz999",
      "DATABASE_URL=postgres://user:pass@host:5432/db",
    ].join("\n");
    const { text, redactionCount } = redactSecrets(input);
    expect(text).not.toContain("hunter2");
    expect(text).not.toContain("abc.def.ghi");
    expect(text).not.toContain("zzz999");
    expect(text).not.toContain("postgres://user:pass@host:5432/db");
    expect(redactionCount).toBe(4);
  });

  it("redacts PEM private key blocks entirely", () => {
    const pem = [
      "-----BEGIN RSA PRIVATE KEY-----",
      "MIIEpAIBAAKCAQEA1234567890abcdef",
      "-----END RSA PRIVATE KEY-----",
    ].join("\n");
    const { text, redactionCount } = redactSecrets(`before\n${pem}\nafter`);
    expect(text).toContain("[REDACTED]");
    expect(text).not.toContain("MIIEpAIBAAKCAQEA1234567890abcdef");
    expect(text).toContain("before");
    expect(text).toContain("after");
    expect(redactionCount).toBe(1);
  });

  it("redacts Authorization headers and bare bearer tokens", () => {
    const { text: withHeader } = redactSecrets("Authorization: Bearer abc123.def456");
    expect(withHeader).not.toContain("abc123.def456");
    expect(withHeader.toLowerCase()).toContain("authorization");

    const { text: bare } = redactSecrets("curl -H 'bearer abc123xyz' https://api.example.com");
    expect(bare).not.toContain("abc123xyz");
  });

  it("leaves ordinary text untouched", () => {
    const input = "Fixed the webhook handler to verify the raw request body before parsing.";
    const { text, redactionCount } = redactSecrets(input);
    expect(text).toBe(input);
    expect(redactionCount).toBe(0);
  });

  it("handles null/empty input safely", () => {
    expect(redactSecrets(null).text).toBe("");
    expect(redactSecrets(undefined).text).toBe("");
    expect(redactSecrets("").redactionCount).toBe(0);
  });
});

describe("sanitizeChangedFiles", () => {
  it("drops sensitive and noise files, keeps the rest", () => {
    const files = [
      { path: "src/index.ts" },
      { path: ".env" },
      { path: "node_modules/pkg/index.js" },
      { path: "README.md" },
    ];
    const { files: kept, excludedPaths } = sanitizeChangedFiles(files);
    expect(kept.map((f) => f.path)).toEqual(["src/index.ts", "README.md"]);
    expect(excludedPaths).toEqual([".env", "node_modules/pkg/index.js"]);
  });
});

describe("sanitizeCheckpointContext", () => {
  it("sanitizes diff, files, note, and commit messages together", () => {
    const result = sanitizeCheckpointContext({
      diff: "+ const key = process.env.API_KEY ?? 'API_KEY=abc123';",
      files: [
        { path: "src/index.ts", changeType: "modified", staged: false, insertions: 1, deletions: 0 },
        { path: ".env", changeType: "modified", staged: false, insertions: 0, deletions: 0 },
      ],
      developerNote: "Rotated TOKEN=abc123 this morning.",
      commits: [
        { hash: "abc1234", message: "chore: bump PASSWORD=oops", authorName: "dev", date: "2026-01-01" },
      ],
    });

    expect(result.files).toHaveLength(1);
    expect(result.files[0].path).toBe("src/index.ts");
    expect(result.summary.filesExcluded).toBe(1);
    expect(result.summary.excludedFilePaths).toEqual([".env"]);
    expect(result.diff).not.toContain("abc123");
    expect(result.developerNote).not.toContain("abc123");
    expect(result.commits[0].message).not.toContain("oops");
    expect(result.summary.secretsRedacted).toBeGreaterThan(0);
  });

  it("preserves a null developer note", () => {
    const result = sanitizeCheckpointContext({
      diff: "",
      files: [],
      developerNote: null,
      commits: [],
    });
    expect(result.developerNote).toBeNull();
  });
});
