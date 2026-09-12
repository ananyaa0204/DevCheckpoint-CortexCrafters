export const SETTINGS_DEFAULTS = {
  ollama_endpoint: "http://localhost:11434",
  ollama_model: "qwen2.5-coder:7b",
  secret_redaction_enabled: "true",
  theme: "dark",
} as const;

export type SettingsKey = keyof typeof SETTINGS_DEFAULTS;
