# Claude Frontend Implementation Prompt

You are implementing the approved DevCheckpoint frontend.

Before writing code, read:

1. `ARCHITECTURE.md`
2. `AGENT_RULES.md`
3. `DESIGN_SYSTEM.md`
4. `UI_IMPLEMENTATION.md`
5. `COMPONENT_MAP.md`

The supplied UI screenshots are approved visual references.

## Rules

- Do not redesign the application.
- Do not invent a different color system.
- Do not change navigation structure unless required by functionality.
- Reuse components aggressively.
- Match spacing, typography, panel density, borders, and dark theme as closely as practical.
- Use Next.js + React + TypeScript + Tailwind + shadcn/ui.
- Use lucide-react for icons.
- Use JetBrains Mono for code and terminal content.
- Keep the application desktop-first.
- Keep code separate from data access and AI services.
- Use mock data only where backend functionality is not yet connected.
- Clearly mark mock data so it can be replaced later.
- Do not implement cloud features that are not part of the local-first MVP.
- Do not create fake working integrations.

## First task

Do not build every page at once.

First implement:

1. Theme tokens
2. AppShell
3. Sidebar
4. Topbar
5. Reusable Card / Panel / Badge / Button patterns
6. Dashboard page

After completing the Dashboard:

- run type checking
- run linting
- fix errors
- show me the files changed
- explain reusable components created

Then stop and wait for approval before implementing the next page.

## Visual target

The interface should feel like:

- Linear-level density
- Vercel-level restraint
- GitHub-level developer familiarity
- IDE-level technical clarity

It must still look like DevCheckpoint, not a clone of another product.
