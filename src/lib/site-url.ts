/**
 * The canonical public origin for this Signal deployment.
 *
 * Single source of truth for `metadataBase`, the sitemap, and robots so the
 * three can never drift apart. Falls back to the production host when
 * NEXT_PUBLIC_SITE_URL is unset (local builds, preview environments) — the
 * same value that was previously inlined into the root layout's metadataBase.
 *
 * Origin only: no trailing slash, no path. Compose absolute URLs with
 * `new URL(path, SITE_URL)` or template strings against it.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://signal.signalstudio.ie";
