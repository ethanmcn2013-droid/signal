/**
 * Analytics audience packs — same shape as Roadmap's domains.
 * Drives the AudienceToggle and reseeds the cinematic briefing demo.
 */

export type DomainId = "wedding" | "construction" | "freelance" | "student";

export type BlockId = "attention" | "moving" | "risks" | "focus";

export type DemoItem = {
  id: string;
  /** Phrasing variants — the rotation engine swaps these mid-loop. */
  variants: string[];
  /** Provenance — e.g. "from Tasks · Wedding 2026". */
  provenance: string;
  /** Plain-English reason chain shown when "Why this?" expands. */
  whyThis?: string[];
  /**
   * The trigger that fired — surfaced inside the "Why this?" expansion to
   * make the determinism experienceable. e.g. `inactive-project · ≥ 8 days`.
   * One of the ten rules from PRODUCT.md §5.1.
   */
  triggerName?: string;
};

export type DemoBlock = {
  id: BlockId;
  label: string;
  dot: string;
  items: DemoItem[];
  /** Items that try to enter "Needs attention" — capped silently. */
  overflow?: { id: string; text: string }[];
};

export type DomainPack = {
  id: DomainId;
  label: string;
  description: string;
  workspaceName: string;
  workspaceEyebrow: string;
  greeting: string;
  blocks: DemoBlock[];
  /** Item id whose phrasing swaps mid-loop. */
  swapItemId: string;
  /** Item id that the cursor inspects with "Why this?". */
  inspectItemId: string;
};

export const DOMAIN_ORDER: DomainId[] = [
  "wedding",
  "construction",
  "freelance",
  "student",
];

export const BLOCK_DOT: Record<BlockId, string> = {
  attention: "#f59e0b",
  moving: "#10b981",
  risks: "#71717a",
  focus: "var(--brand)",
};

export const BLOCK_LABEL: Record<BlockId, string> = {
  attention: "Needs attention",
  moving: "Moving well",
  risks: "Quiet risks",
  focus: "Suggested focus",
};

// ── Wedding pack ────────────────────────────────────────────────────────────
const WEDDING_TODAY: DemoBlock[] = [
  {
    id: "attention",
    label: BLOCK_LABEL.attention,
    dot: BLOCK_DOT.attention,
    items: [
      {
        id: "florist",
        provenance: "from Tasks · Wedding 2026",
        variants: [
          "Florist deposit has been held up since March 2",
          "Florist hasn't confirmed since March 2",
          "Florist needs the deposit moved before Friday",
        ],
        whyThis: [
          "No status update in 18 days.",
          "Held-up items normally resolve in 8 days at this stage.",
          "Threshold crossed → surfaced for attention.",
        ],
        triggerName: "inactive-project · ≥ 8 days",
      },
      {
        id: "catering",
        provenance: "from Tasks · Wedding 2026",
        variants: ["Catering tasting needs a final headcount by Friday"],
        whyThis: [
          "Deadline in 2 days.",
          "Dependent on 'Send RSVPs' — also incomplete.",
        ],
      },
      {
        id: "invitations",
        provenance: "from Tasks · Wedding 2026",
        variants: ["Invitations are 14 days overdue"],
        whyThis: ["Due date passed 14 days ago. No movement since."],
      },
    ],
    overflow: [
      { id: "diet", text: "Guest dietary requirements not collected" },
      { id: "officiant", text: "Officiant rehearsal not scheduled" },
    ],
  },
  {
    id: "moving",
    label: BLOCK_LABEL.moving,
    dot: BLOCK_DOT.moving,
    items: [
      { id: "rsvps", provenance: "from Tasks · Wedding 2026", variants: ["Save-the-dates landed at 96 confirmed RSVPs"] },
      { id: "venue", provenance: "from Tasks · Wedding 2026", variants: ["Venue contract signed three weeks ahead of plan"] },
    ],
  },
  {
    id: "risks",
    label: BLOCK_LABEL.risks,
    dot: BLOCK_DOT.risks,
    items: [
      { id: "music", provenance: "from Tasks · Wedding 2026", variants: ["Music supplier hasn't replied in 9 days"] },
      { id: "hair", provenance: "from Tasks · Wedding 2026", variants: ["Hair-and-makeup trial overlaps with rehearsal dinner"] },
      { id: "honeymoon", provenance: "from Tasks · Wedding 2026", variants: ["Honeymoon flights still unbooked at 47 days out"] },
    ],
  },
  {
    id: "focus",
    label: BLOCK_LABEL.focus,
    dot: BLOCK_DOT.focus,
    items: [
      { id: "florist-focus", provenance: "today's priority", variants: ["Confirm florist deposit Monday"] },
      { id: "headcount-focus", provenance: "by Friday", variants: ["Send catering headcount by Friday"] },
      { id: "music-focus", provenance: "this week", variants: ["Chase music supplier this week"] },
    ],
  },
];


// ── Construction pack ──────────────────────────────────────────────────────
const CONSTRUCTION_TODAY: DemoBlock[] = [
  {
    id: "attention",
    label: BLOCK_LABEL.attention,
    dot: BLOCK_DOT.attention,
    items: [
      {
        id: "windows",
        provenance: "from Tasks · Oak House",
        variants: [
          "Windows on backorder since March 3",
          "Window supplier hasn't confirmed since March 3",
          "Windows are 18 days late — chase supplier today",
        ],
        whyThis: [
          "No status update in 18 days.",
          "Frame phase complete; windows now on the critical path.",
          "Risk of cascading delay → surfaced for attention.",
        ],
        triggerName: "dependency-stall · ≥ 5 days",
      },
      {
        id: "electrical",
        provenance: "from Tasks · Oak House",
        variants: ["Electrical first-fix needs a final wiring plan by Friday"],
        whyThis: ["Deadline in 2 days.", "Owner sign-off still pending."],
      },
      {
        id: "planning",
        provenance: "from Tasks · Oak House",
        variants: ["Planning amendment is 11 days overdue"],
        whyThis: ["Due date passed 11 days ago.", "Council response time normally 7-10 days."],
      },
    ],
    overflow: [
      { id: "skip", text: "Skip hire not rebooked for next phase" },
      { id: "insurance", text: "Site insurance renewal in 12 days" },
    ],
  },
  {
    id: "moving",
    label: BLOCK_LABEL.moving,
    dot: BLOCK_DOT.moving,
    items: [
      { id: "frame", provenance: "from Tasks · Oak House", variants: ["Frame raised three days ahead of plan"] },
      { id: "demo", provenance: "from Tasks · Oak House", variants: ["Demolition came in under budget"] },
    ],
  },
  {
    id: "risks",
    label: BLOCK_LABEL.risks,
    dot: BLOCK_DOT.risks,
    items: [
      { id: "plumber", provenance: "from Tasks · Oak House", variants: ["Plumber hasn't replied in 7 days"] },
      { id: "weather", provenance: "from Tasks · Oak House", variants: ["Plaster scheduled on a forecast rain week"] },
      { id: "owner", provenance: "from Tasks · Oak House", variants: ["Owner hasn't approved kitchen layout — 14 days out"] },
    ],
  },
  {
    id: "focus",
    label: BLOCK_LABEL.focus,
    dot: BLOCK_DOT.focus,
    items: [
      { id: "windows-focus", provenance: "today's priority", variants: ["Call window supplier this morning"] },
      { id: "wiring-focus", provenance: "by Friday", variants: ["Sign off wiring plan with electrician"] },
      { id: "owner-focus", provenance: "this week", variants: ["Get kitchen layout approved by owner"] },
    ],
  },
];


// ── Freelance pack ─────────────────────────────────────────────────────────
const FREELANCE_TODAY: DemoBlock[] = [
  {
    id: "attention",
    label: BLOCK_LABEL.attention,
    dot: BLOCK_DOT.attention,
    items: [
      {
        id: "invoice",
        provenance: "from Tasks · Client work",
        variants: [
          "Brand project invoice unpaid since February 12",
          "The biggest invoice has been unpaid 31 days",
          "Invoice needs a payment reminder before it ages further",
        ],
        whyThis: [
          "Payment terms were 14 days. It has been 31.",
          "Largest of four invoices still owed to you.",
          "Threshold crossed → surfaced for attention.",
        ],
        triggerName: "overdue · past due, no done status",
      },
      {
        id: "logo",
        provenance: "from Tasks · Client work",
        variants: ["Maple Café logo — client feedback overdue since March 4"],
        whyThis: ["Waiting on the client for 12 days.", "The final round can't start until they reply."],
      },
      {
        id: "tax",
        provenance: "from Tasks · Client work",
        variants: ["Self-assessment tax return due in 6 days"],
        whyThis: ["Deadline in 6 days.", "Nothing gathered yet."],
      },
    ],
    overflow: [
      { id: "portfolio", text: "Portfolio site still shows last year's work" },
      { id: "enquiry", text: "New-enquiry form is going to spam" },
    ],
  },
  {
    id: "moving",
    label: BLOCK_LABEL.moving,
    dot: BLOCK_DOT.moving,
    items: [
      { id: "album", provenance: "from Tasks · Client work", variants: ["Wedding album delivered — client signed off"] },
      { id: "retainer", provenance: "from Tasks · Client work", variants: ["Retainer renewed for another six months"] },
    ],
  },
  {
    id: "risks",
    label: BLOCK_LABEL.risks,
    dot: BLOCK_DOT.risks,
    items: [
      { id: "stack", provenance: "from Tasks · Client work", variants: ["Three projects all land in the same week in April"] },
      { id: "enquiries", provenance: "from Tasks · Client work", variants: ["No new enquiries in 9 days"] },
      { id: "hosting", provenance: "from Tasks · Client work", variants: ["Hosting renewal auto-charges in 12 days"] },
    ],
  },
  {
    id: "focus",
    label: BLOCK_LABEL.focus,
    dot: BLOCK_DOT.focus,
    items: [
      { id: "invoice-focus", provenance: "today's priority", variants: ["Send the invoice reminder this morning"] },
      { id: "logo-focus", provenance: "by Thursday", variants: ["Chase Maple Café for logo feedback"] },
      { id: "tax-focus", provenance: "this week", variants: ["Start the tax return"] },
    ],
  },
];


// ── Student pack ───────────────────────────────────────────────────────────
const STUDENT_TODAY: DemoBlock[] = [
  {
    id: "attention",
    label: BLOCK_LABEL.attention,
    dot: BLOCK_DOT.attention,
    items: [
      {
        id: "chapter",
        provenance: "from Tasks · Final year",
        variants: [
          "Dissertation chapter draft due in 3 days",
          "The chapter draft hasn't moved in 11 days",
          "Chapter needs a full draft before the supervisor meeting",
        ],
        whyThis: [
          "Deadline in 3 days.",
          "Only the introduction is written.",
          "Threshold crossed → surfaced for attention.",
        ],
        triggerName: "slow-burn-deadline · ≤ 7 days, < 30% closed",
      },
      {
        id: "feedback",
        provenance: "from Tasks · Final year",
        variants: ["Supervisor feedback unread since March 6"],
        whyThis: ["Sent 9 days ago.", "Revisions can't start until it's read."],
      },
      {
        id: "seminar",
        provenance: "from Tasks · Final year",
        variants: ["Seminar reading for Thursday not started"],
        whyThis: ["Seminar in 2 days.", "About 40 pages outstanding."],
      },
    ],
    overflow: [
      { id: "library", text: "Library books due back in 4 days" },
      { id: "ethics", text: "Ethics form still not submitted" },
    ],
  },
  {
    id: "moving",
    label: BLOCK_LABEL.moving,
    dot: BLOCK_DOT.moving,
    items: [
      { id: "litreview", provenance: "from Tasks · Final year", variants: ["Literature review handed in two days early"] },
      { id: "abstract", provenance: "from Tasks · Final year", variants: ["Conference abstract accepted"] },
    ],
  },
  {
    id: "risks",
    label: BLOCK_LABEL.risks,
    dot: BLOCK_DOT.risks,
    items: [
      { id: "termstack", provenance: "from Tasks · Final year", variants: ["Three deadlines stacked in the last week of term"] },
      { id: "funding", provenance: "from Tasks · Final year", variants: ["Funding application not started — closes in 21 days"] },
      { id: "lab", provenance: "from Tasks · Final year", variants: ["Lab time still not booked for the experiment"] },
    ],
  },
  {
    id: "focus",
    label: BLOCK_LABEL.focus,
    dot: BLOCK_DOT.focus,
    items: [
      { id: "chapter-focus", provenance: "today's priority", variants: ["Draft the dissertation chapter"] },
      { id: "feedback-focus", provenance: "by Wednesday", variants: ["Read the supervisor feedback"] },
      { id: "seminar-focus", provenance: "this week", variants: ["Do the seminar reading"] },
    ],
  },
];


export const DOMAINS: Record<DomainId, DomainPack> = {
  wedding: {
    id: "wedding",
    label: "Wedding plan",
    description: "a planner who needs the day-by-day signal instead of a board to check",
    workspaceName: "Wedding 2026",
    workspaceEyebrow: "Wednesday · 06:00",
    greeting: "Good morning.",
    swapItemId: "florist",
    inspectItemId: "florist",
    blocks: WEDDING_TODAY,
  },
  construction: {
    id: "construction",
    label: "Building project",
    description: "a contractor who wants the morning brief instead of a daily standup",
    workspaceName: "Oak House extension",
    workspaceEyebrow: "Wednesday · 06:00",
    greeting: "Good morning.",
    swapItemId: "windows",
    inspectItemId: "windows",
    blocks: CONSTRUCTION_TODAY,
  },
  freelance: {
    id: "freelance",
    label: "Client work",
    description:
      "a freelancer juggling several clients who needs to know which one needs them this week",
    workspaceName: "Client work",
    workspaceEyebrow: "Wednesday · 06:00",
    greeting: "Good morning.",
    swapItemId: "invoice",
    inspectItemId: "invoice",
    blocks: FREELANCE_TODAY,
  },
  student: {
    id: "student",
    label: "Final year",
    description: "a student running research, teaching, and writing in parallel",
    workspaceName: "Final year",
    workspaceEyebrow: "Wednesday · 06:00",
    greeting: "Good morning.",
    swapItemId: "chapter",
    inspectItemId: "chapter",
    blocks: STUDENT_TODAY,
  },
};
