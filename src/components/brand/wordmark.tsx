import Link from "next/link";

interface WordmarkProps {
  className?: string;
  size?: string;
  href?: string;
}

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
          color: "var(--ink-900)",
        }}
      >
        analytics
        <span
          style={{
            display: "inline-block",
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "var(--indigo-600)",
            marginLeft: 3,
            transform: "translateY(-3px)",
            flexShrink: 0,
          }}
          aria-hidden
        />
      </span>
    </Link>
  );
}
