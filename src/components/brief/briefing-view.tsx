import type { BriefItem, Briefing, FocusItem } from "@/lib/briefing/types";

/**
 * Shared render tree for the briefing. Used by /app/brief (web) and
 * eventually by <BriefingEmail/> (email). Email render will inline
 * the same hierarchy without the why-this expansions and without
 * the cursor/hover affordances.
 */
export function BriefingView({
  briefing,
  firstName,
}: {
  briefing: Briefing;
  firstName?: string | null;
}) {
  const stamp = new Date(briefing.generatedAt).toLocaleString("en-IE", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <article className="mx-auto w-full max-w-[640px] px-6 py-12">
      <div className="mb-1 flex items-center justify-between">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: "var(--ink-quiet)" }}
        >
          Daily Signal · {stamp}
        </p>
        <span
          className="text-[10.5px] uppercase tracking-[0.12em]"
          style={{ color: "var(--ink-quiet)" }}
        >
          Today
        </span>
      </div>

      <h1
        className="mb-10 text-[32px] font-semibold leading-[1.15]"
        style={{ color: "var(--ink)" }}
      >
        {greeting(briefing.greetingHour, firstName)}
      </h1>

      {briefing.isEmpty ? (
        <EmptyState />
      ) : (
        <>
          <Bucket title="Needs attention" items={briefing.needsAttention} />
          <Bucket title="Moving well" items={briefing.movingWell} muted />
          <Bucket title="Quiet risks" items={briefing.quietRisks} />
          <FocusBlock items={briefing.suggestedFocus} />
        </>
      )}

      <p
        className="mt-12 text-[11.5px]"
        style={{ color: "var(--ink-quiet)" }}
      >
        Three items per block. Hard cap. The signal, not the noise.
      </p>
    </article>
  );
}

function Bucket({
  title,
  items,
  muted,
}: {
  title: string;
  items: BriefItem[];
  muted?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mb-8">
      <h2
        className="mb-4 text-[14px] font-semibold"
        style={{
          color: muted ? "var(--ink-soft)" : "var(--ink)",
        }}
      >
        {title}
      </h2>
      <ul className="space-y-5">
        {items.map((item) => (
          <li key={item.id}>
            <p
              className="text-[16px] leading-[1.5]"
              style={{ color: "var(--ink)" }}
            >
              {item.text}
            </p>
            <p
              className="mt-1 text-[12px]"
              style={{ color: "var(--ink-quiet)" }}
            >
              from {item.sourceLabel}
            </p>
            {item.reasons.length > 0 && (
              <details className="mt-2 group">
                <summary
                  className="cursor-pointer text-[12px] hover:underline"
                  style={{ color: "var(--ink-soft)" }}
                >
                  Why this →
                </summary>
                <ul
                  className="mt-1.5 space-y-1 pl-3 text-[12.5px]"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {item.reasons.map((r, i) => (
                    <li key={i}>→ {r}</li>
                  ))}
                </ul>
              </details>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function FocusBlock({ items }: { items: FocusItem[] }) {
  if (items.length === 0) return null;
  return (
    <section
      className="mt-10 rounded-2xl border p-6"
      style={{
        borderColor: "color-mix(in srgb, var(--brand) 22%, transparent)",
        background: "color-mix(in srgb, var(--brand) 4%, transparent)",
      }}
    >
      <h2
        className="mb-4 text-[14px] font-semibold"
        style={{ color: "var(--ink)" }}
      >
        Suggested focus
      </h2>
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-baseline justify-between gap-4"
          >
            <span
              className="text-[15.5px] leading-[1.45]"
              style={{ color: "var(--ink)" }}
            >
              {item.text}
            </span>
            <span
              className="shrink-0 text-[11px] uppercase tracking-[0.12em]"
              style={{ color: "var(--ink-quiet)" }}
            >
              {item.due}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-2xl border p-10 text-center"
      style={{
        borderColor: "var(--line-soft, rgba(20,21,26,0.08))",
        background: "var(--bg-sunken, rgba(20,21,26,0.02))",
      }}
    >
      <p
        className="text-[18px] font-medium"
        style={{ color: "var(--ink)" }}
      >
        Nothing to flag today.
      </p>
      <p
        className="mt-2 text-[14px]"
        style={{ color: "var(--ink-soft)" }}
      >
        No briefing email is sent on quiet days. The board is clear.
      </p>
    </div>
  );
}

function greeting(hour: number, firstName?: string | null): string {
  const base =
    hour < 5
      ? "It's late"
      : hour < 12
        ? "Good morning"
        : hour < 17
          ? "Good afternoon"
          : "Good evening";
  return firstName ? `${base}, ${firstName}.` : `${base}.`;
}
