"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useClerk } from "@clerk/nextjs";

function humaniseError(message: string | undefined, status: number): string {
  if (status === 401) return "You're signed out. Sign in again, then retry.";
  if (status === 500)
    return "Something went wrong on our end. Try again in a moment. If it keeps failing, email hello@signalstudio.ie.";
  return message ?? `Delete failed (${status}).`;
}

/**
 * App Store 5.1.1(v) compliant account deletion for Signal.
 *
 * Same pattern as Roadmap / Tasks / Notes — typed-email confirm,
 * inline-reveal, auto-focus on reveal, scroll-into-view. Server purges
 * Analytics' per-user prefs (rotation cursors, link to Tasks workspace,
 * IANA tz) AND the email subscription record in the separate
 * email-DB before calling Clerk admin delete.
 *
 * Uses CSS-variable colors to match Analytics' lib aesthetic. The
 * rose-band stays consistent across the suite so a reviewer flowing
 * through four products sees identical destructive semantics.
 */
export function DangerZone({ email }: { email: string }) {
  const router = useRouter();
  const { signOut } = useClerk();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const matches = typed.trim().toLowerCase() === email.toLowerCase();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!confirming) return;
    inputRef.current?.focus();
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [confirming]);

  async function runDelete() {
    if (!matches || pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(humaniseError(body.message, res.status));
      }
      await signOut({ redirectUrl: "/" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPending(false);
    }
  }

  return (
    <section
      className="mt-10 rounded-xl border p-5"
      style={{
        borderColor: "rgba(176, 72, 72, 0.20)",
        background: "rgba(176, 72, 72, 0.04)",
      }}
    >
      <h2
        className="text-[14px] font-semibold tracking-tight"
        style={{ color: "var(--ink)" }}
      >
        Delete account
      </h2>
      <p
        className="mt-1.5 max-w-[560px] text-[12.5px] leading-[1.6]"
        style={{ color: "var(--ink-soft)" }}
      >
        Closes your Signal account across every product — Tasks, Notes,
        Timeline, Signal. Your briefings stop immediately. Workspaces you
        own are removed, along with everyone you've invited. There's no undo.
      </p>

      {!confirming ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-md border bg-white px-3 py-1.5 text-[12.5px] font-medium transition-colors"
            style={{ borderColor: "rgba(176, 72, 72, 0.35)", color: "#9a3a3a" }}
          >
            Delete account
          </button>
        </div>
      ) : (
        <div
          ref={panelRef}
          className="mt-4 rounded-md border p-4"
          style={{
            borderColor: "rgba(176, 72, 72, 0.25)",
            background: "rgba(255, 255, 255, 0.70)",
          }}
        >
          <label
            htmlFor="confirm-email"
            className="text-[11px] uppercase tracking-[0.12em]"
            style={{ color: "#9a3a3a" }}
          >
            Type your email to confirm
          </label>
          <input
            ref={inputRef}
            id="confirm-email"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={email}
            autoComplete="off"
            disabled={pending}
            className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-[13.5px] outline-none transition-colors disabled:opacity-60"
            style={{
              borderColor: matches
                ? "rgba(176, 72, 72, 0.55)"
                : "rgba(176, 72, 72, 0.25)",
              color: "var(--ink)",
            }}
          />
          {error ? (
            <p className="mt-3 text-[12px]" style={{ color: "#9a3a3a" }}>
              {error}
            </p>
          ) : null}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                if (pending) return;
                setConfirming(false);
                setTyped("");
                setError(null);
              }}
              disabled={pending}
              className="rounded-md px-3 py-1.5 text-[12.5px] transition-colors disabled:opacity-60"
              style={{ color: "#9a3a3a" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={runDelete}
              disabled={!matches || pending}
              className="rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors"
              style={{
                background: matches && !pending ? "#9a3a3a" : "#e8c9c9",
                color: matches && !pending ? "#ffffff" : "rgba(255,255,255,0.6)",
                cursor: matches && !pending ? "pointer" : "not-allowed",
              }}
            >
              {pending ? "Deleting…" : "Delete account"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
