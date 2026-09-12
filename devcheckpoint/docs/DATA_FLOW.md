# Data Flow

## Checkpoint Creation

```text
Selected Local Repository
          ↓
Read-only Git Collector
          ↓
Task Context
          ↓
Context Builder
          ↓
Secret / Sensitive Data Sanitizer
          ↓
Local Ollama Model
          ↓
Structured Summary
          ↓
Zod Validator
          ↓
SQLite via Prisma
          ↓
DevCheckpoint UI
```

## Stored Locally

Examples:

```text
Project metadata
Task metadata
Checkpoint metadata
Changed-file references
Developer notes
AI summary
Optional sanitized error metadata
Optional sanitized command metadata
```

## Not Stored by Default

```text
Full repository copies
Ollama model binaries
Raw secrets
.env contents
SSH keys
private keys
```

## Trust Boundary

For the MVP, the key boundary is the selected local repository. DevCheckpoint should not silently access unrelated filesystem locations.
