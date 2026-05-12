import { Wordmark } from "@/components/brand/wordmark";
import { SuiteLauncher } from "@/components/suite-launcher";
import { UserButtonWithSuite } from "@/components/user-button-with-suite";

/**
 * Authenticated app chrome for Signal Analytics. Thin top bar:
 * `signal studio. /` launcher prefix + analytics wordmark on the
 * left, Clerk avatar (with suite-jump dropdown) on the right.
 *
 * Matches the parity established in the Tasks sidebar / Roadmap top
 * bar / Notes suitebar from the suite-coherence cycles.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}
    >
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "color-mix(in srgb, var(--bg) 88%, transparent)",
          backdropFilter: "saturate(160%) blur(10px)",
          WebkitBackdropFilter: "saturate(160%) blur(10px)",
          borderBottomColor: "var(--border-soft)",
        }}
      >
        <div className="mx-auto flex h-12 w-full max-w-[1140px] items-center justify-between px-6">
          <div className="flex items-center" style={{ gap: 12 }}>
            <SuiteLauncher current="analytics" />
            <span
              aria-hidden
              className="hidden sm:inline"
              style={{ color: "var(--ink-faint)", fontSize: 12 }}
            >
              /
            </span>
            <Wordmark size="1rem" />
          </div>
          <UserButtonWithSuite current="analytics" />
        </div>
      </header>
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}
