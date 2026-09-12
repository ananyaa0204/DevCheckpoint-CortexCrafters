import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Always navigates to a deterministic parent route rather than relying on
 * browser history (`router.back()`), which is unreliable when a page is
 * opened directly, from global search, or after an app restart — the user
 * should never click Back and land somewhere unexpected or leave the app.
 */
export function BackButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" />
      {label}
    </Link>
  );
}
