"use server";

import { prisma } from "@/lib/db/prisma";
import { SETTINGS_DEFAULTS, type SettingsKey } from "@/lib/settings-defaults";

export async function getSettings(): Promise<Record<SettingsKey, string>> {
  const rows = await prisma.settings.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    ollama_endpoint: map.ollama_endpoint ?? SETTINGS_DEFAULTS.ollama_endpoint,
    ollama_model: map.ollama_model ?? SETTINGS_DEFAULTS.ollama_model,
    secret_redaction_enabled:
      map.secret_redaction_enabled ?? SETTINGS_DEFAULTS.secret_redaction_enabled,
    theme: map.theme ?? SETTINGS_DEFAULTS.theme,
  };
}

export async function updateSetting(key: SettingsKey, value: string) {
  await prisma.settings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function updateSettings(values: Partial<Record<SettingsKey, string>>) {
  await Promise.all(
    Object.entries(values).map(([key, value]) =>
      prisma.settings.upsert({
        where: { key },
        update: { value: value! },
        create: { key, value: value! },
      })
    )
  );
}
