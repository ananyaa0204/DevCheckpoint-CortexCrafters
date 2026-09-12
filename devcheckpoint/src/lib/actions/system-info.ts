"use server";

import { getAppDataDir } from "@/lib/db/app-data";
import pkg from "../../../package.json";

export async function getSystemInfo() {
  return {
    appDataDir: getAppDataDir(),
    version: pkg.version,
    platform: process.platform,
  };
}
