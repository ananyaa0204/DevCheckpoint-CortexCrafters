const KEY_VALUE_SECRET_NAMES = [
  "API_KEY",
  "SECRET",
  "TOKEN",
  "PASSWORD",
  "PRIVATE_KEY",
  "ACCESS_TOKEN",
  "REFRESH_TOKEN",
  "DATABASE_URL",
].join("|");

/** e.g. `API_KEY=abc123`, `"password": "hunter2"`, `STRIPE_SECRET_KEY = sk_live_...` */
export const KEY_VALUE_PATTERN = new RegExp(
  `\\b([A-Z0-9_]*(?:${KEY_VALUE_SECRET_NAMES})[A-Z0-9_]*\\s*[:=]\\s*)(?:"[^"\\n]*"|'[^'\\n]*'|[^\\s,;\\n]+)`,
  "gi"
);

/** PEM-style private key blocks, e.g. `-----BEGIN RSA PRIVATE KEY----- ... -----END ...-----`. */
export const PEM_BLOCK_PATTERN = /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY-----/gi;

/** `Authorization: Bearer <token>` (or Basic/other schemes) headers. */
export const AUTHORIZATION_HEADER_PATTERN = /\b(authorization\s*:\s*)\S+(?:\s+\S+)?/gi;

/** A bare `Bearer <token>` not preceded by an Authorization header (already handled above). */
export const BEARER_TOKEN_PATTERN = /\bbearer\s+[A-Za-z0-9\-._~+/]+=*/gi;
