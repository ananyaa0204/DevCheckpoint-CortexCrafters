# Security Policy

DevCheckpoint operates on developer source code and local development metadata, so security and privacy are core product requirements.

## Local-First Default

The MVP should keep the following on the user's computer:

- repository paths
- Git status and diffs
- task notes
- checkpoints
- errors and command context
- AI summaries
- SQLite database

The default AI runtime is local Ollama.

## Repository Scope

DevCheckpoint may only access a repository explicitly selected by the user.

It must not scan the user's full filesystem or automatically traverse unrelated parent directories.

## Sensitive Files

Never automatically read or send these to the AI context pipeline:

```text
.env
.env.*
*.pem
*.key
id_rsa
id_ed25519
credentials.json
secrets.*
SSH keys
private keys
```

## Secret Redaction

Before an AI request is created, context must be passed through a sanitizer that detects common secret patterns including:

```text
API_KEY=
SECRET=
TOKEN=
PASSWORD=
PRIVATE_KEY
BEGIN RSA PRIVATE KEY
BEGIN OPENSSH PRIVATE KEY
```

Detected values should be replaced with:

```text
[REDACTED]
```

## Git Safety

MVP Git integration is read-only.

Allowed examples:

```text
git status --short
git branch --show-current
git diff
git diff --cached
git log -n 5 --oneline
```

DevCheckpoint must not automatically run Git write operations such as commit, push, pull, reset, checkout, merge, rebase, stash, or clean.

## Command Safety

Do not execute captured terminal commands automatically.

If command capture is added, command arguments must be sanitized before persistence.

## Reporting a Security Issue

During the hackathon/development stage, report security concerns directly to the repository owner rather than publishing secrets or proof-of-concept credentials in a public issue.
