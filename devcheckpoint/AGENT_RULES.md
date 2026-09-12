# DevCheckpoint Agent Rules

These rules define how an AI coding agent should work on the DevCheckpoint codebase.

The goal is to keep the project simple, secure, local-first, and aligned with the MVP.

---

## 1. Product Goal

DevCheckpoint is a local-first developer productivity tool that saves the context around a coding task.

Core message:

> Git saves your code. DevCheckpoint saves the context around your code.

The MVP must support:

1. Select a local Git repository
2. Create a task
3. Read Git status, branch, diff, and recent commits
4. Add an optional developer note
5. Save a checkpoint
6. Send relevant context to a local Ollama model
7. Generate a structured AI summary
8. Store the checkpoint locally in SQLite
9. Resume the task later

Do not expand the product beyond this flow until the MVP is working reliably.

---

## 2. Required Technology Stack

Use the following stack unless explicitly instructed otherwise:

### Desktop
- Tauri
- Rust only where native functionality is required

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### Local Database
- SQLite
- Prisma ORM

### Git
- Git CLI
- simple-git

### AI
- Ollama
- Qwen coding model
- Zod for structured output validation

### File Monitoring
- Chokidar

Do not introduce another framework, database, ORM, state library, backend framework, or AI provider unless there is a clear technical requirement.

---

## 3. Local-First Rule

DevCheckpoint must work primarily on the user's machine.

Project source code, Git diffs, task data, notes, checkpoints, errors, and local context must remain local by default.

Do not:

- Upload repositories to third-party services
- Send project code to cloud APIs
- Add analytics that transmit source-code-related data
- Add cloud authentication to the MVP
- Add cloud database dependencies
- Add telemetry without explicit approval

Ollama should be treated as the default AI runtime.

Default endpoint:

```text
http://localhost:11434
```

---

## 4. Security Rules

Security is a core product requirement.

Never automatically send these files or values to an AI model:

```text
.env
.env.*
*.pem
*.key
id_rsa
id_ed25519
credentials.json
secrets.*
private keys
API keys
passwords
access tokens
refresh tokens
SSH keys
database credentials
```

Before constructing an AI request, run context through a sanitizer.

Redact suspicious values using:

```text
[REDACTED]
```

Detect common patterns such as:

```text
API_KEY=
SECRET=
TOKEN=
PASSWORD=
PRIVATE_KEY
BEGIN RSA PRIVATE KEY
BEGIN OPENSSH PRIVATE KEY
```

Never log secrets to the console or database.

---

## 5. Repository Access Rules

Only access repositories explicitly selected by the user.

Do not scan the user's entire computer.

Do not access parent directories outside the selected project.

Ignore these directories by default:

```text
node_modules
.git
.next
dist
build
coverage
vendor
.cache
out
target
```

Also ignore:

- binaries
- large generated files
- media files unless explicitly needed
- dependency lockfile contents unless relevant

Do not modify user project files as part of context collection.

DevCheckpoint should read developer projects, not edit them.

---

## 6. Git Rules

Use Git only for safe, read-only context gathering during the MVP.

Allowed operations include:

```bash
git status --short
git branch --show-current
git diff
git diff --cached
git log -n 5 --oneline
```

Do not automatically run:

```text
git commit
git push
git pull
git reset
git checkout
git switch
git merge
git rebase
git stash
git clean
```

Any future Git write operation must require an explicit user action.

Prefer `simple-git` rather than manually constructing shell commands.

---

## 7. AI Context Rules

Do not send the entire repository to Ollama.

Only include useful context such as:

```text
Task title
Task description
Current branch
Git status
Changed files
Git diff
Recent commits
Developer notes
Captured errors
Relevant recent commands
```

Large diffs must be truncated or summarized before inference.

Prioritize:

1. Modified files
2. Staged files
3. Files mentioned in the task
4. Files associated with captured errors
5. Recent related Git changes

The AI must not invent missing development history.

---

## 8. AI Output Format

Prefer structured JSON over free-form text.

Expected checkpoint output:

```json
{
  "task": "",
  "changes": [],
  "blocker": "",
  "attempts": [],
  "importantFiles": [],
  "nextStep": ""
}
```

Validate responses with Zod before storing them.

If validation fails:

1. Retry once with a stricter formatting instruction
2. If it still fails, return a controlled error
3. Do not silently save invalid data

Never parse AI output using fragile string splitting if structured JSON can be used.

---

## 9. Database Rules

Use Prisma with SQLite.

Primary entities:

```text
Project
Task
Checkpoint
ChangedFile
CommandLog
ErrorLog
Handoff
Settings
```

Use proper relations and foreign keys.

Do not store duplicate large Git diffs unnecessarily.

For MVP development:

- Keep the schema simple
- Use migrations
- Do not manually modify the SQLite database
- Do not introduce PostgreSQL or another database

Before changing the Prisma schema, consider whether the new field is actually required for the MVP.

---

## 10. Tauri Boundary Rules

Use Tauri only when native desktop access is required.

Examples:

- Folder selection
- Local path access
- Native filesystem permissions
- Safe command execution
- Opening files or folders

Keep business logic in TypeScript where possible.

Do not move ordinary application logic into Rust without a reason.

Rust commands must:

- validate input
- restrict file access
- avoid arbitrary shell execution
- return structured errors
- never expose secrets

---

## 11. Frontend Rules

The UI should be simple and developer-focused.

Main screens:

```text
Dashboard
Add Project
Project Workspace
Start Task
Save Checkpoint
Checkpoint Details
Resume Task
Handoff
Settings
```

Prioritize clarity over visual complexity.

Every important action should have:

- loading state
- success state
- error state
- disabled state when unavailable

Do not create unnecessary pages, animations, dashboards, charts, or settings during the MVP.

Use shadcn/ui components where practical instead of recreating standard components.

---

## 12. TypeScript Rules

Use TypeScript strictly.

Avoid:

```typescript
any
```

unless unavoidable.

Prefer:

- typed interfaces
- Zod schemas
- explicit return types for important service functions
- reusable domain types

Keep files reasonably small.

Avoid giant components and giant service files.

Separate:

```text
UI
business logic
Git logic
AI logic
database logic
security logic
```

---

## 13. Error Handling

Never silently swallow errors.

User-facing errors should be understandable.

Examples:

```text
Selected folder is not a Git repository.
Ollama is not running.
The selected AI model is not installed.
Checkpoint generation failed.
Repository path is no longer available.
AI response could not be validated.
```

Technical details may be logged locally for development, but secrets must be redacted.

---

## 14. Ollama Availability

Before generating a checkpoint, verify that Ollama is available.

If unavailable, show a clear message such as:

```text
Ollama is not running. Start Ollama and try again.
```

Also check that the configured model exists.

Do not crash the application if Ollama is unavailable.

A checkpoint may still save raw local context without an AI summary if this behavior is intentionally supported.

---

## 15. File Watching Rules

Chokidar is optional for the first working MVP.

Do not begin with complex background monitoring.

When added, track only lightweight events:

```text
File created
File changed
File deleted
Timestamp
```

Do not continuously read full file contents on every filesystem event.

Debounce noisy events.

Always respect ignored directories.

---

## 16. Terminal and Command Rules

Automatic terminal capture is not required for the first MVP.

Do not build a full terminal emulator.

If command capture is added later:

- store only useful recent commands
- do not store secrets passed as CLI arguments
- redact suspicious command values
- do not execute captured commands automatically

Never replay commands without explicit user approval.

---

## 17. Implementation Order

Build in this order.

### Milestone 1 — Base App

- Next.js
- Tauri
- TypeScript
- Tailwind
- shadcn/ui
- basic navigation

### Milestone 2 — Project Selection

- choose local folder
- validate Git repository
- save project locally

### Milestone 3 — Task Management

- create task
- view active task
- pause/complete task

### Milestone 4 — Git Context

- current branch
- Git status
- changed files
- Git diff
- recent commits

### Milestone 5 — Database

- Prisma
- SQLite
- Project
- Task
- Checkpoint

### Milestone 6 — Local AI

- Ollama connection
- Qwen model
- context sanitizer
- structured prompt
- Zod response validation

### Milestone 7 — Checkpoint

- Save Checkpoint
- AI summary
- persist locally
- checkpoint detail screen

### Milestone 8 — Resume

- latest checkpoint
- current blocker
- important files
- next step
- resume flow

### Milestone 9 — Handoff

- generate concise handoff
- copy/export text

### Milestone 10 — Optional Automation

Only after everything above works:

- Chokidar
- error capture
- lightweight command history
- richer context automation

---

## 18. Testing Rules

Every major service should be independently testable.

Prioritize tests for:

```text
Repository validation
Git context parsing
Secret sanitization
AI response validation
Checkpoint creation
Database persistence
Ollama error handling
```

The secret sanitizer should have strong test coverage.

Do not rely only on manual UI testing.

---

## 19. Performance Rules

Do not read thousands of project files during normal checkpoint creation.

Checkpoint creation should primarily use Git metadata.

Avoid blocking the UI while:

- running Git commands
- calling Ollama
- accessing SQLite
- scanning files

Use async operations appropriately.

Large diffs should have configurable limits.

---

## 20. No Overengineering Rule

For every new feature, ask:

> Is this required to make the core checkpoint workflow work?

If not, do not build it yet.

Specifically avoid adding these during the MVP unless explicitly requested:

```text
Vector database
Embeddings
RAG framework
Microservices
Docker
Redis
Message queues
Kubernetes
Cloud backend
Multi-user accounts
Real-time collaboration
GitHub OAuth
VS Code extension
Browser extension
Complex agent framework
Automatic autonomous coding
```

---

## 21. Coding Agent Behavior

When working on this repository, the AI coding agent should:

1. Read `ARCHITECTURE.md` before making architectural changes.
2. Follow this file as the implementation rulebook.
3. Inspect existing code before creating new abstractions.
4. Reuse existing utilities and components where appropriate.
5. Make the smallest safe change that solves the requirement.
6. Do not rewrite unrelated working code.
7. Do not remove existing functionality unless explicitly requested.
8. Preserve backwards compatibility where practical.
9. Explain major architectural changes before implementing them.
10. Run relevant tests, linting, and type checking after changes.
11. Fix errors caused by its own changes.
12. Never claim something works without verifying it where possible.

---

## 22. Before Writing Code

For any non-trivial feature, first identify:

```text
What needs to change?
Which files are involved?
Does the database schema change?
Does Tauri permission configuration change?
Does this touch security-sensitive data?
Can this be implemented without adding a new dependency?
```

Prefer modifying the existing architecture over introducing parallel systems.

---

## 23. Dependency Rules

Before installing a new package:

1. Check whether the project already has a solution.
2. Check whether Node, React, Tauri, Prisma, or the browser already provides the capability.
3. Add the package only if it provides meaningful value.
4. Prefer maintained and widely used packages.
5. Avoid packages for trivial utility functions.

Do not change package managers.

Use the package manager already configured by the repository.

---

## 24. Definition of Done

A feature is complete only when:

- it works in the desktop app
- TypeScript compiles
- linting passes
- relevant tests pass
- errors are handled
- loading states are handled
- secrets are not exposed
- local-first behavior is preserved
- existing MVP functionality still works

---

## 25. Core Product Boundary

DevCheckpoint is not intended to replace:

```text
Git
GitHub
Cursor
Claude Code
Copilot
VS Code
```

It should complement those tools.

The core value is remembering development context across interruptions and task switching.

Always protect that product focus.

---

## 26. Final Rule

When choosing between:

```text
a clever complex implementation
```

and:

```text
a simple reliable implementation
```

choose the simple reliable implementation.

The MVP should feel fast, understandable, safe, and dependable.
