"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signalHref } from "./links";
import type { SignalView } from "./signal-types";

const VIEWS: ReadonlyArray<{ view: SignalView; label: string; pathname: string }> = [
  { view: "briefing", label: "Briefing", pathname: "/app" },
  { view: "overview", label: "Overview", pathname: "/app/overview" },
  { view: "trends", label: "Trends", pathname: "/app/trends" },
];

interface SignalViewTabsProps {
  current: SignalView;
}

export function SignalViewTabs({ current }: SignalViewTabsProps) {
  const searchParams = useSearchParams();

  return (
    <nav className="signal-tabs" aria-label="Signal views">
      <ul className="signal-tabs-list">
        {VIEWS.map((item) => (
          <li key={item.view}>
            <Link
              className="signal-tab"
              href={signalHref(item.pathname, searchParams, {
                evidence: null,
                evidence_page: null,
                page: null,
              })}
              aria-current={current === item.view ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
