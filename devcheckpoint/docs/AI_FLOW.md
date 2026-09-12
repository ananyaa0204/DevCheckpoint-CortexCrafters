# AI Flow

DevCheckpoint does not use AI as a generic chat interface. AI is used to synthesize captured development context into a structured checkpoint.

## Pipeline

```text
Task information
      +
Git metadata
      +
Developer notes
      +
Optional errors / commands
      ↓
Context Collector
      ↓
Size / relevance filter
      ↓
Secret Sanitizer
      ↓
Prompt Formatter
      ↓
Ollama (localhost:11434)
      ↓
Qwen coding model
      ↓
Structured JSON
      ↓
Zod Validation
      ↓
Retry once if malformed
      ↓
Persist validated checkpoint
```

## Context Selection

Priority order:

1. Task title and description
2. Current branch
3. Changed/staged files
4. Git diff
5. Developer note
6. Captured blocker/error
7. Relevant recent commands
8. Recent commits

The full repository should not be sent to the model.

## Model Responsibility

The model should summarize and organize available evidence. It must not invent missing history, fabricated errors, or unobserved attempts.

## Failure Handling

If Ollama is unavailable:

- show a clear local error
- do not crash
- optionally allow raw checkpoint data to be saved without AI summary

If output is invalid:

- retry once with a strict JSON instruction
- if still invalid, return a controlled error
