import type { BriefItem, Briefing } from "@/lib/briefing/types";
import { ageNote, greeting } from "@/lib/briefing/voice";

/** "from Tasks · Wedding 2026 · still waiting — day 3" */
function metaLine(item: BriefItem): string {
  const age = item.ageDays ? ` · ${ageNote(item.trigger, item.ageDays)}` : "";
  return `    from ${item.sourceLabel}${age}`;
}

/**
 * Plain-text alternative for the briefing email. Providing both
 * html + text in the multipart/alternative envelope is a real
 * deliverability signal — most spam filters punish html-only.
 */
export function renderBriefingText(
  b: Briefing,
  links: {
    unsubscribeUrl: string;
    preferencesUrl: string;
    viewInBrowserUrl: string;
  },
  cadence: "daily" | "weekly",
  firstName?: string | null,
): string {
  const date = new Date(b.generatedAt).toLocaleDateString("en-IE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const lines: string[] = [];

  lines.push(
    `signal studio. / analytics — ${cadence === "weekly" ? "Weekly" : "Daily"} brief`,
  );
  lines.push(date);
  lines.push("");
  lines.push(greeting(b.greetingHour, firstName, true));
  lines.push("");

  if (b.needsAttention.length > 0) {
    lines.push("NEEDS ATTENTION");
    for (const item of b.needsAttention) {
      lines.push(`  ${item.text}`);
      lines.push(metaLine(item));
    }
    lines.push("");
  }

  if (b.movingWell.length > 0) {
    lines.push("MOVING WELL");
    for (const item of b.movingWell) {
      lines.push(`  ${item.text}`);
      lines.push(metaLine(item));
    }
    lines.push("");
  }

  if (b.quietRisks.length > 0) {
    lines.push("QUIET RISKS");
    for (const item of b.quietRisks) {
      lines.push(`  ${item.text}`);
      lines.push(metaLine(item));
    }
    lines.push("");
  }

  if (b.suggestedFocus.length > 0) {
    lines.push("SUGGESTED FOCUS");
    for (const item of b.suggestedFocus) {
      lines.push(`  ${item.text}  (${item.due})`);
    }
    lines.push("");
  }

  lines.push("Three per block. Hard cap.");
  lines.push("");
  lines.push("―");
  lines.push(`Stop these emails:    ${links.unsubscribeUrl}`);
  lines.push(
    `${cadence === "daily" ? "Send weekly instead" : "Send daily instead"}: ${links.preferencesUrl}`,
  );
  lines.push(`View in browser:      ${links.viewInBrowserUrl}`);
  lines.push("");
  lines.push("Sent by signal studio. — one short read per day, no marketing.");

  return lines.join("\n");
}

// greeting moved to @/lib/briefing/voice (single source of truth).
