# Contributing to DevCheckpoint

## Development Principles

1. Preserve the local-first architecture.
2. Do not introduce cloud dependencies without an explicit product decision.
3. Prefer simple, reliable implementations.
4. Keep Git operations read-only unless a feature explicitly requires otherwise.
5. Never commit secrets or local user databases.
6. Read `ARCHITECTURE.md` and `AGENT_RULES.md` before making structural changes.

## Branch Naming

Examples:

```text
feat/project-selection
feat/git-context
feat/checkpoints
fix/ollama-validation
chore/docs
```

## Commit Style

Use Conventional Commit style where practical:

```text
feat: initialize Tauri and Next.js app
feat: add local repository selection
feat: add Git context collection
fix: redact secrets before AI inference
docs: add local model setup
```

## Pull Requests

A pull request should explain:

- what changed
- why it changed
- how it was tested
- UI screenshots when relevant
- security/privacy impact when relevant

## Before Opening a PR

Once the app scaffold exists, run the project checks configured in `package.json`, expected to include type checking, linting, and relevant tests.
