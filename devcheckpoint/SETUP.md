# Local Development Setup — macOS

This document describes the intended local development environment for DevCheckpoint.

> The application scaffold has not yet been committed. Commands under "Run the app" become applicable after Phase 1 initialization.

## 1. Apple Command Line Tools

```bash
xcode-select --install
```

## 2. Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Verify:

```bash
brew --version
```

## 3. Git

```bash
brew install git
git --version
```

## 4. Node.js via NVM

```bash
brew install nvm
mkdir -p ~/.nvm
```

Add to `~/.zshrc`:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$(brew --prefix nvm)/nvm.sh" ] && \. "$(brew --prefix nvm)/nvm.sh"
```

Then:

```bash
source ~/.zshrc
nvm install --lts
nvm use --lts
```

## 5. pnpm

```bash
npm install -g pnpm
pnpm --version
```

## 6. Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

Verify:

```bash
rustc --version
cargo --version
```

## 7. SQLite

```bash
brew install sqlite
sqlite3 --version
```

## 8. Ollama

```bash
brew install --cask ollama
```

Verify:

```bash
ollama --version
```

Start Ollama if required:

```bash
ollama serve
```

## 9. Local Model

Recommended initial model for a capable Apple Silicon machine:

```bash
ollama pull qwen2.5-coder:7b
```

For lower-memory systems:

```bash
ollama pull qwen2.5-coder:3b
```

Test:

```bash
ollama run qwen2.5-coder:7b
```

## 10. Run the App

After application initialization:

```bash
pnpm install
pnpm tauri dev
```

## 11. Security Reminder

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
