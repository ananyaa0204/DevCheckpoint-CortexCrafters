# Local Development Setup — Windows

This document describes the intended local development environment for DevCheckpoint on Windows.

> The application scaffold has not yet been committed. Commands under "Run the app" become applicable after Milestone 1 initialization.

## 1. Git

Install [Git for Windows](https://git-scm.com/download/win).

```powershell
git --version
```

## 2. Node.js

Install via [nvm-windows](https://github.com/coreybutler/nvm-windows) or the official Node installer.

```powershell
nvm install lts
nvm use lts
node --version
```

## 3. pnpm

```powershell
npm install -g pnpm
pnpm --version
```

## 4. Rust + Tauri prerequisites

```powershell
winget install Rustlang.Rustup
rustc --version
cargo --version
```

Tauri on Windows additionally requires:

- **Microsoft C++ Build Tools** ("Desktop development with C++" workload from Visual Studio Build Tools)
- **WebView2 Runtime** (preinstalled on current Windows 10/11; install manually if missing)

## 5. SQLite

SQLite itself ships as a library used through Prisma; no standalone install is required for development, but the CLI is useful for inspection:

```powershell
winget install SQLite.SQLite
sqlite3 --version
```

## 6. Ollama

Install the native Windows build from [ollama.com](https://ollama.com/download/windows).

```powershell
ollama --version
```

Start Ollama if it is not already running as a service:

```powershell
ollama serve
```

## 7. Local Model

```powershell
ollama pull qwen2.5-coder:7b
```

For lower-memory machines:

```powershell
ollama pull qwen2.5-coder:3b
```

Test:

```powershell
ollama run qwen2.5-coder:7b
```

## 8. Run the App

After application initialization:

```powershell
pnpm install
pnpm tauri dev
```

## 9. Cross-Platform Notes

- Development happens on Windows; final testing also happens on macOS. Application code must not assume a specific OS.
- Use Node's `path` module (not hardcoded `/` or `\`) for all filesystem paths.
- Git line endings are normalized via `.gitattributes` (`eol=lf`) — do not rely on OS-default line endings.
- Do not hardcode Unix-only or Windows-only shell commands; keep Git operations limited to the read-only commands defined in `SECURITY.md` / `AGENT_RULES.md`, invoked through `simple-git`.

## 10. Security Reminder

Never commit:

```text
.env
API keys
tokens
passwords
private keys
SQLite user databases
Ollama model files
node_modules
.next
src-tauri/target
```

See [SECURITY.md](SECURITY.md).
