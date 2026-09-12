# Hackathon Demo Script

## 1. Set the problem

"Git tells us what changed. It does not always tell us what was happening in our head when we stopped."

Show a developer task that is mid-debug.

## 2. Start a task

Example:

```text
Fix Stripe webhook verification
```

Show project + branch.

## 3. Show working context

Show:

- changed files
- current error/blocker
- developer note
- Git diff

## 4. Save Checkpoint

Click **Save Checkpoint**.

Explain that DevCheckpoint collects only relevant context, filters sensitive information, and sends it to the local Ollama model.

## 5. Show AI summary

Highlight:

- What you were doing
- What changed
- Current blocker
- What you already tried
- Important files
- Next step

## 6. Switch away

Open another task/project.

## 7. Resume

Return to the original task and click **Resume Development**.

The checkpoint should immediately reconstruct the useful context.

## 8. Handoff

Generate a concise handoff summary for another developer.

## Closing line

> Git saves your code. DevCheckpoint saves the context around your code.
