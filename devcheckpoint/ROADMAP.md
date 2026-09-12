# DevCheckpoint Roadmap

## Phase 0 — Product Definition

- [x] Product concept
- [x] Hackathon track alignment
- [x] Product requirements
- [x] Technical requirements
- [x] Backend schema
- [x] Architecture
- [x] Agent implementation rules
- [x] UI design system
- [x] Core UI reference screens

## Phase 1 — Application Foundation

- [ ] Initialize Next.js + TypeScript
- [ ] Initialize Tauri
- [ ] Configure Tailwind CSS
- [ ] Configure shadcn/ui
- [ ] Configure Prisma + SQLite
- [ ] Add application shell, sidebar, topbar, and design tokens

## Phase 2 — Local Project Management

- [ ] Select local folder through Tauri
- [ ] Validate selected path as Git repository
- [ ] Store project metadata
- [ ] Build project workspace

## Phase 3 — Task Management

- [ ] Create task
- [ ] Associate task with project and branch
- [ ] Pause / resume / complete task
- [ ] Add notes and related files

## Phase 4 — Git Context

- [ ] Current branch
- [ ] Git status
- [ ] Modified files
- [ ] Staged files
- [ ] Git diff
- [ ] Recent commits
- [ ] Context-size limits

## Phase 5 — Checkpoints

- [ ] Capture task + Git context
- [ ] Add developer note
- [ ] Sanitize secrets
- [ ] Persist raw checkpoint state
- [ ] Display checkpoint history

## Phase 6 — Local AI

- [ ] Check Ollama availability
- [ ] Configure Qwen model
- [ ] Build structured checkpoint prompt
- [ ] Validate output with Zod
- [ ] Retry malformed output once
- [ ] Store validated AI summary

## Phase 7 — Resume Development

- [ ] Resume page
- [ ] Objective
- [ ] Blocker
- [ ] Attempts
- [ ] Important files
- [ ] Next step
- [ ] Open project / IDE action

## Phase 8 — Handoff

- [ ] Create handoff from checkpoint
- [ ] Generate concise handoff summary
- [ ] Copy / export Markdown

## Phase 9 — Context Automation

- [ ] Chokidar watcher
- [ ] File activity events
- [ ] Lightweight command/error capture
- [ ] Event debouncing

## Phase 10 — Polish

- [ ] Error states
- [ ] Loading states
- [ ] Empty states
- [ ] Accessibility pass
- [ ] Performance pass
- [ ] Installer/build testing
- [ ] Demo preparation
