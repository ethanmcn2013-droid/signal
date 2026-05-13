import Link from "next/link";

interface WordmarkProps {
  className?: string;
  size?: string;
  href?: string;
}

/**
 * Signal Analytics wordmark — `analytics·` with the M·04 tick gesture
 * per the suite design system (v1, 2026-05-13). The dot is the canonical
 * middot (lifted), and its motion is a scope-style vertical pulse —
 * registering a signal — running every 2.4s on `spring-glide`.
 */
export function Wordmark({
  className,
  size = "1.125rem",
  href = "/",
}: WordmarkProps) {
  return (
    <Link
      href={href}
      aria-label="Signal Analytics"
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
        analytics
        <span className="analytics-dot" aria-hidden />
      </span>
    </Link>
  );
}
