"use client";

import { useState, useTransition } from "react";
import { sendTestBriefingAction, type SendTestResult } from "./actions";

export function SendTestButton({ email }: { email: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SendTestResult | null>(null);

  function onClick() {
    setResult(null);
    startTransition(async () => {
      const r = await sendTestBriefingAction();
      setResult(r);
    });
  }

  return (
    <div className="mt-10">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded-md border px-3.5 py-2 text-[13.5px] font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)] disabled:opacity-60"
        style={{
          borderColor: "var(--line-soft, rgba(20,21,26,0.18))",
          background: "var(--bg, #fff)",
          color: "var(--ink, #14151a)",
        }}
      >
        {pending ? "Sending…" : "Send a test now"}
      </button>
      <p
        className="mt-2 text-[12px]"
        style={{ color: "var(--ink-quiet)" }}
      >
        Fires a real briefing to{" "}
        <span style={{ color: "var(--ink-soft)" }}>{email}</span>. Skipped if
        nothing's worth surfacing.
      </p>
      {result && (
        <p
          role="status"
          className="mt-3 rounded-md border px-3 py-2 text-[12.5px] leading-[1.5]"
          style={{
            borderColor: result.ok
              ? "rgba(46,160,110,0.35)"
              : "rgba(194,65,12,0.35)",
            background: result.ok
              ? "rgba(46,160,110,0.06)"
              : "rgba(194,65,12,0.05)",
            color: result.ok ? "rgb(36,120,84)" : "rgb(155,52,10)",
          }}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
