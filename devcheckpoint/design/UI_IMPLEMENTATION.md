# DevCheckpoint UI Implementation Guide

## 1. Purpose

This document tells the coding agent how to reproduce the approved DevCheckpoint UI consistently.

The screenshots define **visual direction**.

The following documents define behavior and architecture:

```text
ARCHITECTURE.md
AGENT_RULES.md
PRD / Technical Requirements
Backend Schema
DESIGN_SYSTEM.md
```

Do not redesign screens during implementation.

---

## 2. Frontend Stack

Use:

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
lucide-react
sonner
```

Desktop shell:

```text
Tauri
```

---

## 3. Global App Shell

Create one reusable shell.

Suggested structure:

```tsx
<AppShell>
  <Sidebar />
  <MainArea>
    <Topbar />
    <PageContent />
  </MainArea>
</AppShell>
```

Do not recreate sidebar or topbar inside every route.

---

## 4. Suggested Route Structure

```text
/
  dashboard

/projects
/projects/new
/projects/[projectId]

/tasks
/tasks/new
/tasks/[taskId]
/tasks/[taskId]/code
/tasks/[taskId]/discussion
/tasks/[taskId]/resume

/checkpoints
/checkpoints/new
/checkpoints/[checkpointId]

/handoffs
/handoffs/new
/handoffs/[handoffId]

/analytics

/settings
```

For MVP, routes may be simplified if backend IDs are not ready.

---

## 5. Shared Components

Create reusable components before implementing every page.

### Layout

```text
AppShell
Sidebar
Topbar
PageHeader
ContentGrid
RightRail
```

### Navigation

```text
SidebarNavItem
Breadcrumbs
TabNav
SearchBar
UserMenu
```

### Data Display

```text
StatCard
StatusBadge
MetadataRow
InfoCard
EmptyState
ActivityItem
FileRow
CommitRow
ProjectRow
TaskRow
CheckpointRow
HandoffRow
```

### Developer UI

```text
CodeDiff
CodeViewer
TerminalPanel
GitStatusCard
BranchBadge
ChangedFileList
FileTree
```

### DevCheckpoint-Specific

```text
CheckpointSummary
BlockerCard
AttemptList
NextStepCard
ImportantFiles
TaskContextCard
CheckpointTimeline
HandoffPreview
AIContextPanel
```

### Forms

```text
TaskForm
ProjectPicker
CheckpointNoteForm
HandoffForm
SettingsSection
```

---

## 6. Dashboard Page

### Goal

Give the user a fast overview of current work.

### Required Sections

```text
Greeting / headline

Stats:
- Active Projects
- Active Tasks
- Saved Checkpoints
- Handoffs

Current Task
Project Context
Recent Checkpoints
Recent Projects
```

### Primary CTA

```text
Resume Task
```

Secondary:

```text
Create Checkpoint
New Task
```

The Current Task card should be the dominant element.

---

## 7. Add Project Page

### Goal

Allow a developer to register a local repository.

### Flow

```text
1. Select Repository
2. Review Details
3. Confirm
```

### Required UI

```text
Local Repository tab
Browse Folder
Selected Path
Git validation state
Recent Repositories
Supported Features
```

MVP should emphasize **Local Repository**.

GitHub/GitLab/Bitbucket may be visually present as future integrations, but should not be wired unless supported.

---

## 8. Project Workspace

### Required Header

```text
Project name
Local badge
Repository path
Current branch
Files changed
Open in Editor
Project Settings
```

Tabs:

```text
Overview
Files
Commits
Tasks
Checkpoints
Settings
```

### Main Area

```text
Git status cards
Changed file list
Diff viewer
Recent commits
```

### Right Rail

```text
Active Task
Task Notes
Quick Actions
```

---

## 9. Start Task Page

### Sections

```text
1. Basic Information
2. Project & Environment
3. Additional Context
```

Fields:

```text
Task title
Description
Project
Branch
Related files
Tags
Current status / notes
```

CTA:

```text
Start Task
```

The form should be compact and practical.

---

## 10. Task Detail Page

Tabs:

```text
Overview
Code Changes
Discussion
Files
Checkpoints
Activity
```

Header:

```text
Task title
Status
Tags
Assignee
Due date (optional)
Priority
```

Main overview:

```text
Description
Current issue
Implementation notes
Progress
Subtasks
Recent activity
```

---

## 11. Code Changes Page

Layout:

```text
File list | Diff viewer | AI / task rail
```

Diff controls:

```text
Side by Side
Unified
Copy Diff
Open in Editor
```

Right rail can show:

```text
AI context summary
Task checklist
Quick analysis actions
```

Do not turn this into a full IDE.

---

## 12. Discussion Page

Use an issue/PR discussion style.

Required:

```text
Comment composer
Comment timeline
Attached file changes
Reactions
Test output snippets
```

Right rail:

```text
Task Details
Description
Subtasks
Related Tasks
```

---

## 13. Save Checkpoint Page

This is a core screen.

Flow:

```text
1. Capture Context
2. Add Notes
3. Generate Summary
4. Save Checkpoint
```

### Main

```text
Project context
Changed files
Diff preview
Developer notes
```

### Right Rail

```text
AI Summary Preview
What will be included?
```

CTA:

```text
Generate Summary
Save Checkpoint
```

The user must understand exactly what data is being captured.

---

## 14. Checkpoints List Page

Layout:

```text
Checkpoint list | Checkpoint details
```

Filters:

```text
Project
Branch
Newest First
My Checkpoints
Shared
Favorites
```

Detail panel:

```text
Task
What Changed
Current Problem / Blocker
What I Already Tried
Next Recommended Step
Important Files
Related Links
```

Actions:

```text
Resume Task
Create Handoff
View in IDE
```

---

## 15. Checkpoint Detail Page

Header:

```text
Checkpoint #ID
Current / historical state
Timestamp
Branch
Commit reference
```

Tabs:

```text
Changes
Context & Notes
Environment
Terminal Output
Related
```

Primary action:

```text
Resume from Here
```

Secondary:

```text
Share
Create Handoff
Restore / Revert (future)
```

For MVP, avoid actual Git restore unless explicitly implemented.

---

## 16. Resume Development Page

This is the second most important screen after Save Checkpoint.

Required sections:

```text
Task
Last Saved Checkpoint

What you were doing
Current blocker
What you already tried
Important files
Next step
Related resources
Recent activity
```

Primary CTA:

```text
Resume Development
```

Secondary:

```text
Open in IDE
Open Last Checkpoint
Create New Checkpoint
```

This page should communicate value immediately.

---

## 17. Handoffs List Page

Tabs:

```text
All
Sent
Received
Drafts
```

List rows:

```text
Title
Project
Status
Recipient / Sender
Timestamp
```

Right panel:

```text
Overview
Files
Instructions
Activity
```

Actions:

```text
Edit
Share Link
Mark as Completed
```

---

## 18. Create Handoff Page

Flow:

```text
1. Select Checkpoint
2. Add Details
3. Review & Share
```

Fields:

```text
Checkpoint
Assign to
Due date
Additional instructions
Access / sharing mode
```

Right panel:

```text
Handoff Preview
AI Generated Summary
What's Included
Handoff Instructions
```

For MVP local-first mode, "share" may simply mean generating exportable text/Markdown.

---

## 19. Analytics Page

Analytics are optional for first MVP.

If included:

```text
Tasks Completed
Average Cycle Time
Checkpoints Created
Handoffs Shared

Progress Overview
Task Distribution
Top Active Projects
Activity Heatmap
Recent Activity
```

Do not prioritize analytics before checkpoint workflow is stable.

---

## 20. Settings Page

Recommended sections:

```text
General
Integrations
AI & Automation
Advanced
```

For local-first MVP, prioritize:

```text
Theme
Default view
Code diff style
Auto-save drafts
Ollama enabled
Ollama endpoint
Selected local model
Secret redaction
Data export
```

Do not add billing/team/cloud settings unless they exist.

---

## 21. Loading States

Use skeletons for:

```text
project loading
Git status
checkpoint details
AI summary
activity feed
```

AI generation should show:

```text
Analyzing context...
Reading Git changes...
Generating summary...
```

Keep progress messaging deterministic; do not pretend to do steps that are not actually happening.

---

## 22. Empty States

Examples:

### No Projects

```text
No projects yet.
Add a local Git repository to start saving development context.
[Add Project]
```

### No Tasks

```text
No active tasks.
Create a task so DevCheckpoint knows what you're working on.
[Start Task]
```

### No Checkpoints

```text
No checkpoints yet.
Save your current development state so you can resume it later.
[Create Checkpoint]
```

---

## 23. Error States

Examples:

```text
Selected folder is not a Git repository.
Repository path is unavailable.
Ollama is not running.
Selected model is not installed.
AI summary could not be generated.
Checkpoint could not be saved.
```

Use inline error cards; avoid browser alert().

---

## 24. Keyboard Shortcuts

Recommended:

```text
⌘ K   Global search
⌘ N   New Task
⌘ S   Save Checkpoint
⌘ H   Create Handoff
```

Shortcuts must not override native behavior in text inputs.

---

## 25. Component Implementation Rules

- Prefer shadcn primitives where appropriate.
- Use Tailwind tokens instead of repeated arbitrary colors.
- Build reusable list rows and card shells.
- Do not hardcode the same sidebar in multiple files.
- Keep code diff rendering isolated as its own component.
- Keep AI summary rendering separate from AI API logic.
- Never couple database calls directly into presentational components.
- Keep loading/error/empty states explicit.

---

## 26. Tailwind Theme Tokens

Use CSS variables or Tailwind theme extension.

Suggested tokens:

```css
--background: #070B11;
--sidebar: #090E15;
--surface-1: #0D131C;
--surface-2: #111923;
--surface-3: #151E2A;
--border: #202A36;
--border-subtle: #18212C;

--text-primary: #F4F7FB;
--text-secondary: #A6B0BF;
--text-muted: #738094;

--primary: #2F74FF;
--success: #22C55E;
--warning: #F59E0B;
--danger: #EF4444;
--purple: #8B5CF6;
--cyan: #38BDF8;
```

---

## 27. First Frontend Implementation Order

Implement in this order:

```text
1. App shell
2. Sidebar
3. Topbar
4. Dashboard
5. Add Project
6. Project Workspace
7. Start Task
8. Task Detail
9. Save Checkpoint
10. Checkpoints List
11. Checkpoint Detail
12. Resume Development
13. Handoffs
14. Settings
15. Analytics / extra screens
```

Do not start with analytics.

---

## 28. Approved Product Feel

The final frontend should feel like:

```text
Linear-level density
Vercel-level restraint
GitHub-level developer familiarity
IDE-level technical clarity
```

But it must remain visually original to DevCheckpoint.

---

## 29. Final Implementation Rule

If a generated UI reference contains a visually attractive element that conflicts with actual product behavior, follow:

```text
Product requirements first
Architecture second
Design system third
Screenshot detail fourth
```

The screenshots are visual references, not authority over functionality.
