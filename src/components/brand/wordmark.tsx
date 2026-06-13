import Link from "next/link";

interface WordmarkProps {
  className?: string;
  size?: string;
  href?: string;
}

/**
 * Signal wordmark — `analytics·` with the M·04 tick gesture
 * per the suite design system (v1, 2026-05-13). The dot is the canonical
 * middot (lifted), and its motion is a discrete jump between sample
 * positions — snapping instantly via steps(1,end), never gliding —
 * once per 3.6s cycle. The dot is always between readings, not travelling.
 */
export function Wordmark({
  className,
  size = "1.125rem",
  href = "/",
}: WordmarkProps) {
  return (
    <Link
      href={href}
      aria-label="Signal"
      style={{ textDecoration: "none" }}
      className={className}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "baseline",
          fontWeight: 600,
          fontSize: size,
          letterSpacing: "-0.03em",
          color: "var(--ink)",
        }}
      >
        signal
        <span className="analytics-dot" aria-hidden />
      </span>
    </Link>
  );
}
