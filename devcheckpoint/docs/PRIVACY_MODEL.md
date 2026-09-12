# Privacy Model

DevCheckpoint is designed around a local-first default.

## Principles

### 1. User-selected scope

The user explicitly selects the repository DevCheckpoint may inspect.

### 2. Local persistence

Project/task/checkpoint data is stored in a local SQLite database.

### 3. Local inference

The default AI runtime is Ollama on the same machine.

### 4. Minimum necessary context

DevCheckpoint should send only relevant task/Git context to the model, not the full repository.

### 5. Secret exclusion

Known secret files are ignored and suspicious values are redacted before inference or persistence.

### 6. No silent cloud sync

The MVP does not require a cloud account or remote source-code upload.

## Future Cloud Features

If cloud collaboration is added later, it should be opt-in and documented separately with a clear data model and user controls.
