# DevCheckpoint Architecture

## 1. Overview

DevCheckpoint is a local-first desktop application that helps developers save and restore the working context around a coding task.

The core idea is simple:

> Git saves your code. DevCheckpoint saves the context around your code.

DevCheckpoint should capture useful development context such as:

- Current task
- Git branch
- Modified files
- Git diff
- Recent commits
- Developer notes
- Errors
- Recent commands
- What has already been tried
- Current blocker
- Recommended next step

The application should keep project data on the user's local machine and use a local AI model through Ollama.

---

## 2. High-Level Architecture

```text
Developer
   |
   v
Tauri Desktop App
   |
   +-----------------------------+
   |                             |
   v                             v
Next.js / React UI         Tauri Native Layer
   |                             |
   |                             +--> Local File System
   |                             +--> Git Repository
   |                             +--> Shell / Commands
   |                             +--> Folder Picker
   |
   v
Application Services
   |
   +--> Project Service
   +--> Task Service
   +--> Git Context Service
   +--> Checkpoint Service
   +--> AI Service
   +--> Security / Secret Filter
   |
   +-------------------+
   |                   |
   v                   v
SQLite / Prisma      Ollama
Local Database          |
                        v
                  Qwen Coding Model
```

---

## 3. Main Technology Stack

### Desktop Layer

- Tauri
- Rust
- Tauri filesystem plugin
- Tauri dialog plugin
- Tauri shell plugin

Tauri provides controlled access to local repositories, files, folders, and system commands.

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- Sonner

### Local Data Layer

- SQLite
- Prisma ORM

### Git Integration

- Git CLI
- simple-git

### File Monitoring

- Chokidar

### AI

- Ollama
- Qwen coding model
- Zod for validating structured AI responses

---

## 4. Core Application Modules

### 4.1 Project Manager

Responsible for registering and managing local development projects.

Responsibilities:

- Select a local repository
- Validate that the selected directory is a Git repository
- Save repository path
- Read repository metadata
- Display project name and branch
- Track recently opened projects

---

### 4.2 Task Manager

A task represents what the developer is currently working on.

Example:

```text
Fix Stripe webhook verification
```

Task data may include:

```text
Task title
Task description
Project
Status
Start time
Last checkpoint
Created date
Updated date
```

Possible statuses:

```text
ACTIVE
PAUSED
COMPLETED
```

---

### 4.3 Git Context Collector

The Git Context Collector gathers development information from the selected repository.

It should collect:

```text
Current branch
Git status
Modified files
Added files
Deleted files
Git diff
Recent commits
```

Example commands:

```bash
git status --short
git branch --show-current
git diff
git log -n 5 --oneline
```

The application should use `simple-git` where possible.

---

### 4.4 Context Engine

The Context Engine prepares information before sending it to the AI model.

Input:

```text
Task description
Git status
Git diff
Changed files
Developer note
Errors
Recent commands
Recent commits
```

The Context Engine should:

1. Remove unnecessary information.
2. Remove sensitive information.
3. Limit very large Git diffs.
4. Prioritize changed files.
5. Build a structured AI prompt.
6. Send only relevant context to Ollama.

The entire repository should never be sent to the model.

---

## 5. AI Architecture

DevCheckpoint communicates with Ollama locally.

Default endpoint:

```text
http://localhost:11434
```

Example model:

```text
qwen2.5-coder:7b
```

AI request flow:

```text
Context Collector
      |
      v
Secret Filter
      |
      v
Context Formatter
      |
      v
Ollama API
      |
      v
Qwen Model
      |
      v
Structured JSON
      |
      v
Zod Validation
      |
      v
Checkpoint Database
```

---

## 6. AI Output Schema

The AI should return structured JSON whenever possible.

Example:

```json
{
  "task": "Fix Stripe webhook verification",
  "changes": [
    "Updated webhook handler",
    "Modified Stripe middleware"
  ],
  "blocker": "Stripe signature verification is failing",
  "attempts": [
    "Changed webhook secret",
    "Updated middleware"
  ],
  "importantFiles": [
    "src/api/webhook.ts",
    "src/lib/stripe.ts"
  ],
  "nextStep": "Check whether the raw request body is modified before Stripe verification"
}
```

Zod should validate this response before it is saved.

If validation fails:

1. Retry once with a stricter prompt.
2. If it fails again, show a controlled error.
3. Never save malformed AI output as a valid checkpoint.

---

## 7. Checkpoint System

A checkpoint represents the state of a development task at a particular moment.

A checkpoint should contain:

```text
Task
Timestamp
Branch
Changed files
Git diff summary
Developer note
Errors
Recent commands
AI summary
Current blocker
Attempts
Important files
Next step
```

Workflow:

```text
Developer clicks Save Checkpoint
            |
            v
Read project state
            |
            v
Collect Git information
            |
            v
Add developer notes/errors
            |
            v
Remove sensitive data
            |
            v
Send context to local AI
            |
            v
Validate AI response
            |
            v
Save checkpoint to SQLite
```

---

## 8. Resume Task Flow

When a developer returns to a task:

```text
Select Project
     |
     v
Select Previous Task
     |
     v
Load Latest Checkpoint
     |
     v
Show:

Task
Current blocker
Files changed
Already tried
Important files
Next step
     |
     v
Resume Development
```

The developer should understand the previous state without reading through Git history manually.

---

## 9. Database Architecture

Main entities:

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

Basic relationships:

```text
Project
  |
  +---- Task
          |
          +---- Checkpoint
                  |
                  +---- ChangedFile
                  +---- CommandLog
                  +---- ErrorLog
```

### Project

```text
id
name
path
createdAt
updatedAt
```

### Task

```text
id
projectId
title
description
status
createdAt
updatedAt
```

### Checkpoint

```text
id
taskId
branch
developerNote
aiTaskSummary
blocker
nextStep
createdAt
```

### ChangedFile

```text
id
checkpointId
path
changeType
```

### ErrorLog

```text
id
checkpointId
message
source
createdAt
```

### CommandLog

```text
id
checkpointId
command
outputSummary
createdAt
```

---

## 10. Local File Monitoring

Chokidar can be used to monitor the active repository.

The watcher should ignore:

```text
node_modules
.git
.next
dist
build
coverage
vendor
large binaries
generated files
```

The watcher should initially record only basic file activity.

Example:

```text
File changed
File created
File deleted
Timestamp
```

Advanced automatic context capture can be added after the MVP.

---

## 11. Security Architecture

DevCheckpoint is local-first.

Sensitive project information should not leave the machine unless the user explicitly enables a cloud provider in the future.

The system must avoid collecting:

```text
.env
.env.local
Private keys
SSH keys
API tokens
Passwords
Access tokens
Secret configuration files
Credentials
```

Before sending context to Ollama, DevCheckpoint should run a secret filter.

Example patterns to detect:

```text
API_KEY=
SECRET=
TOKEN=
PASSWORD=
PRIVATE_KEY
BEGIN RSA PRIVATE KEY
BEGIN OPENSSH PRIVATE KEY
```

Suspicious values should be replaced with:

```text
[REDACTED]
```

---

## 12. Main Application Screens

### Dashboard

Displays:

```text
Projects
Active tasks
Recent checkpoints
```

### Add Project

Allows the developer to select a local Git repository.

### Project Workspace

Displays:

```text
Project name
Current branch
Git status
Changed files
Active task
Latest checkpoint
```

### Start Task

Fields:

```text
Task title
Task description
```

### Save Checkpoint

Displays collected context and allows an optional developer note.

### Checkpoint Details

Displays:

```text
Current Task
What Changed
Current Blocker
Already Tried
Important Files
Next Step
```

### Resume Task

Loads the latest checkpoint for a selected task.

### Handoff

Generates a concise summary that another developer can use to continue the work.

---

## 13. MVP Architecture

The first version should stay simple.

Required MVP flow:

```text
Select Local Repository
        |
        v
Create Task
        |
        v
Read Git Status + Diff
        |
        v
Add Optional Developer Note
        |
        v
Save Checkpoint
        |
        v
Send Context to Ollama
        |
        v
Generate Structured Summary
        |
        v
Save to SQLite
        |
        v
Resume Task Later
```

Do not build these features until the MVP works:

```text
Automatic terminal monitoring
Deep codebase indexing
Embeddings
Vector database
IDE plugins
Team cloud sync
Complex background agents
Multi-user collaboration
```

---

## 14. Suggested Folder Structure

```text
devcheckpoint/
|
+-- src/
|   |
|   +-- app/
|   |   +-- page.tsx
|   |   +-- projects/
|   |   +-- tasks/
|   |   +-- checkpoints/
|   |   +-- settings/
|   |
|   +-- components/
|   |   +-- ui/
|   |   +-- projects/
|   |   +-- tasks/
|   |   +-- checkpoints/
|   |
|   +-- lib/
|   |   +-- git/
|   |   |   +-- git-client.ts
|   |   |   +-- git-context.ts
|   |   |
|   |   +-- ai/
|   |   |   +-- ollama.ts
|   |   |   +-- prompts.ts
|   |   |   +-- schemas.ts
|   |   |
|   |   +-- context/
|   |   |   +-- collector.ts
|   |   |   +-- sanitizer.ts
|   |   |   +-- formatter.ts
|   |   |
|   |   +-- db/
|   |       +-- prisma.ts
|   |
|   +-- services/
|       +-- project-service.ts
|       +-- task-service.ts
|       +-- checkpoint-service.ts
|
+-- prisma/
|   +-- schema.prisma
|
+-- src-tauri/
|   +-- src/
|   +-- capabilities/
|   +-- tauri.conf.json
|
+-- public/
|
+-- package.json
+-- tsconfig.json
+-- .env.example
+-- README.md
+-- ARCHITECTURE.md
```

---

## 15. Development Phases

### Phase 1

Set up:

```text
Next.js
Tauri
SQLite
Prisma
Ollama
Qwen
```

### Phase 2

Build project selection and repository validation.

### Phase 3

Build task creation and task management.

### Phase 4

Implement Git context collection.

### Phase 5

Connect Ollama and generate checkpoint summaries.

### Phase 6

Save checkpoints in SQLite.

### Phase 7

Build Resume Task flow.

### Phase 8

Add file watching and lightweight automatic context capture.

### Phase 9

Add developer handoff.

### Phase 10

Improve UI, error handling, security, and performance.

---

## 16. Design Principles

DevCheckpoint should follow these principles:

1. **Local-first**  
   Project information should stay on the developer's computer.

2. **Simple**  
   Saving and resuming a task should require very few actions.

3. **Context, not duplication**  
   DevCheckpoint should complement Git instead of duplicating GitHub.

4. **AI should summarize, not invent**  
   The model must only use information available in the captured context.

5. **Safe by default**  
   Secrets and sensitive files should never be included automatically.

6. **MVP before automation**  
   Manual checkpoint creation should work perfectly before background automation is added.

---

## 17. Product Principle

DevCheckpoint is not another AI coding assistant.

It is a memory layer around the development workflow.

Its purpose is to answer:

```text
What was I working on?
What problem was I facing?
What did I already try?
Which files matter?
What should I do next?
```

The core product message remains:

> Git saves your code. DevCheckpoint saves the context around your code.
