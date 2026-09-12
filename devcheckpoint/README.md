# DevCheckpoint

> **Git saves your code. DevCheckpoint saves the context around your code.**

DevCheckpoint is a **local-first developer productivity tool** for saving and restoring the working context around a coding task. It is designed for the moments where Git history alone is not enough: interruptions, task switching, debugging sessions, unfinished experiments, and developer handoffs.

A checkpoint can capture what the developer was working on, relevant Git state, changed files, current blockers, what has already been tried, important files, notes, errors, and the most useful next step. A local AI model running through Ollama then turns that information into a structured checkpoint that can be resumed later.

![DevCheckpoint workflow](docs/assets/workflow.png)

## Why DevCheckpoint?

Git is excellent at recording code history, but it does not always preserve the full short-term development context around unfinished work. A developer may know which files changed but still need to reconstruct:

- What was I trying to achieve?
- What was currently broken?
- What approaches had I already tried?
- Which files mattered most?
- What was I going to do next?

DevCheckpoint focuses on that missing workflow context.

## Core Workflow

```text
Select Local Repository
        ↓
Start Task
        ↓
Work Normally
        ↓
Save Checkpoint
        ↓
Collect Git + Task Context
        ↓
Sanitize Sensitive Data
        ↓
Local AI Summary via Ollama
        ↓
Validate Structured Output
        ↓
Store in SQLite
        ↓
Resume Development Later
```

## MVP Features

- Add and validate a local Git repository
- Create development tasks
- Read current branch, Git status, changed files, diff, and recent commits
- Add developer notes and current context
- Generate structured checkpoints with a local AI model
- Save checkpoints locally using SQLite
- Resume a previous task from its latest checkpoint
- Generate a developer handoff summary
- Protect sensitive files and redact secrets before AI processing

## Local-First by Design

The MVP is designed so source-code context stays on the developer's machine:

- Local repositories are accessed only after user selection
- SQLite stores project/task/checkpoint data locally
- Ollama runs the AI model locally
- `.env`, credentials, private keys, tokens, and secret-like data are excluded or redacted
- Git operations used for context collection are read-only

See [SECURITY.md](SECURITY.md) and [docs/PRIVACY_MODEL.md](docs/PRIVACY_MODEL.md).

## Technology Stack

| Area | Technology |
|---|---|
| Desktop | Tauri |
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Database | SQLite |
| ORM | Prisma |
| Git | Git CLI, simple-git |
| File monitoring | Chokidar |
| Local AI | Ollama + Qwen coding model |
| Validation | Zod |
| Icons | lucide-react |

## Hackathon Track

**HackBattle 2026**  
**Track 3 — Developer Tooling**  
**Subtrack — Workflow & Context Management**

The project directly targets developer context switching by preserving task state and making it easy to resume work after an interruption.

See [HACKATHON.md](HACKATHON.md) for the alignment summary.

## UI Direction

DevCheckpoint uses a premium dark developer-tool interface with:

- Linear-level information density
- Vercel-like restraint
- GitHub-like developer familiarity
- IDE-style technical clarity

Approved UI references are stored in [`design/references/`](design/references/).

![Dashboard](design/references/dashboard.png)

## Documentation

### Product & Architecture

- [Architecture](ARCHITECTURE.md)
- [Agent Rules](AGENT_RULES.md)
- [Product Overview](docs/PRODUCT_OVERVIEW.md)
- [User Flow](docs/USER_FLOW.md)
- [Backend Schema](docs/DevCheckpoint_Backend_Schema_Document.docx)
- [Technical Requirements](docs/DevCheckpoint_Technical_Requirements_Document.docx)
- [Product Requirements](docs/DevCheckpoint_PRD.docx)

### AI & Local Model

- [AI Flow](docs/AI_FLOW.md)
- [AI Output Schema](docs/AI_OUTPUT_SCHEMA.md)
- [Local LLM Setup](docs/LOCAL_LLM_SETUP.md)
- [Privacy Model](docs/PRIVACY_MODEL.md)

### Design

- [Design System](design/DESIGN_SYSTEM.md)
- [UI Implementation Guide](design/UI_IMPLEMENTATION.md)
- [Component Map](design/COMPONENT_MAP.md)
- [Claude Frontend Prompt](design/CLAUDE_FRONTEND_PROMPT.md)
- [Screen Map](docs/SCREEN_MAP.md)

## Current Status

The repository currently contains the completed product definition, system architecture, backend schema, technical requirements, UI system, and reference screens. Application implementation is the next phase.

See [ROADMAP.md](ROADMAP.md) and [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md).

## Development Setup

See [SETUP.md](SETUP.md).

Expected development flow after application initialization:

```bash
pnpm install
pnpm tauri dev
```

The exact commands may change when the application scaffold is committed.

## Contribution

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
