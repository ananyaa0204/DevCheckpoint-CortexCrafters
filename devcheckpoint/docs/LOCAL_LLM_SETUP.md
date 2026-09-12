# Local LLM Setup

DevCheckpoint uses Ollama as the default local AI runtime.

## Endpoint

```text
http://localhost:11434
```

## Install Ollama on macOS

```bash
brew install --cask ollama
```

Start the service if needed:

```bash
ollama serve
```

## Recommended Models

### Lower-memory Mac

```bash
ollama pull qwen2.5-coder:3b
```

### Typical Apple Silicon development machine

```bash
ollama pull qwen2.5-coder:7b
```

## Test

```bash
ollama run qwen2.5-coder:7b
```

Example prompt:

```text
Summarize this development task into objective, changes, blocker, attempts, important files, and next step.
```

## Application Checks

Before inference, DevCheckpoint should verify:

1. Ollama is reachable.
2. The configured model exists.
3. Context has been sanitized.
4. Context size is within configured limits.

## Troubleshooting

### Ollama not reachable

Start:

```bash
ollama serve
```

### Model missing

```bash
ollama list
ollama pull qwen2.5-coder:7b
```

### Model is too slow

Use a smaller model and reduce context size.
