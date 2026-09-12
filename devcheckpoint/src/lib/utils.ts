export { cn } from "cn"

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 1000 * 60 * 60 * 24 * 365],
  ["month", 1000 * 60 * 60 * 24 * 30],
  ["day", 1000 * 60 * 60 * 24],
  ["hour", 1000 * 60 * 60],
  ["minute", 1000 * 60],
]

const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

export function formatRelativeTime(date: string | Date): string {
  const target = typeof date === "string" ? new Date(date) : date
  const diffMs = target.getTime() - Date.now()

  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(diffMs) >= ms) {
      return relativeFormatter.format(Math.round(diffMs / ms), unit)
    }
  }
  return "just now"
}
