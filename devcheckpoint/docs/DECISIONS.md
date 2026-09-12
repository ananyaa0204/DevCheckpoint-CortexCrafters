# Architecture Decisions

## ADR-001 — Tauri instead of Electron

**Decision:** Use Tauri for the desktop shell.

**Reason:** DevCheckpoint requires local filesystem and repository access but should remain lightweight. Tauri provides a native desktop boundary while allowing the main UI to remain TypeScript/React.

## ADR-002 — Next.js + TypeScript

**Decision:** Use Next.js/React/TypeScript for the UI and most application logic.

**Reason:** Fast development, strong ecosystem, reusable components, and good compatibility with the selected design system.

## ADR-003 — SQLite + Prisma

**Decision:** Store local product data in SQLite through Prisma.

**Reason:** No server is required for the MVP, persistence is local, and the data model is relational.

## ADR-004 — Ollama + Qwen

**Decision:** Use Ollama with a Qwen coding model for local summarization.

**Reason:** Keeps the core AI flow local and avoids requiring a cloud AI account for the MVP.

## ADR-005 — Read-only Git integration

**Decision:** MVP Git integration is read-only.

**Reason:** DevCheckpoint should observe development context rather than mutate the developer's repository.

## ADR-006 — No vector database in MVP

**Decision:** Do not add embeddings/vector search initially.

**Reason:** The core checkpoint flow can be built from task data and Git metadata. A vector layer would add complexity before product value is validated.

## ADR-007 — Manual checkpoint first

**Decision:** Start with explicit `Save Checkpoint` behavior before automatic background capture.

**Reason:** It is easier to make reliable, understandable, and privacy-conscious. Automation can be added once the core workflow works.
