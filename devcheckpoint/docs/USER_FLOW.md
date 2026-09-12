# User Flow

## Primary Flow

```text
Launch DevCheckpoint
        ↓
Add Local Project
        ↓
Validate Git Repository
        ↓
Start Task
        ↓
Work Normally
        ↓
Save Checkpoint
        ↓
Collect Task + Git Context
        ↓
Sanitize Secrets
        ↓
Generate Local AI Summary
        ↓
Validate Structured Output
        ↓
Save Checkpoint Locally
        ↓
Leave / Switch Task
        ↓
Return Later
        ↓
Resume Development
```

## Add Project

```text
Projects
  ↓
Add Project
  ↓
Browse Folder
  ↓
Validate Git Repo
  ↓
Read Project Metadata
  ↓
Save Project
```

## Start Task

Developer provides:

```text
Task title
Description
Project
Branch
Optional related files
Optional notes
```

## Save Checkpoint

DevCheckpoint captures:

```text
Task
Current branch
Git status
Changed files
Git diff
Recent commits
Developer notes
Optional errors / command context
```

Then creates:

```text
What you were doing
What changed
Current blocker
What you already tried
Important files
Next step
```

## Resume Task

The developer opens the saved task and sees the latest checkpoint immediately, then can open the project/IDE and continue.

## Handoff

```text
Checkpoint
  ↓
Generate Handoff
  ↓
Add Instructions
  ↓
Generate concise summary
  ↓
Copy / export Markdown
```
