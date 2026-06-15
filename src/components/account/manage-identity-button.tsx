"use client";

import { useClerk } from "@clerk/nextjs";

/**
 * A quiet, hosted path into Clerk's account portal so the "lives in your
 * account" line isn't a dead end. Opens the Clerk user profile in place.
 * Signal (suite) register — brand indigo, the crafted chevron.
 */
export function ManageIdentityButton() {
  const { openUserProfile } = useClerk();
  return (
    <button
      type="button"
      onClick={() => openUserProfile()}
      className="group mb-3 inline-flex items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-[13.5px] font-medium transition-colors"
      style={{
        borderColor: "var(--line, rgba(20,21,26,0.12))",
        background: "var(--bg-elev, #ffffff)",
        color: "var(--ink-soft)",
      }}
    >
      Manage sign-in &amp; profile
      <svg
        className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--brand)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}
