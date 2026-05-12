/**
 * Analytics audience packs — same shape as Roadmap's domains.
 * Drives the AudienceToggle and reseeds the cinematic briefing demo.
 */

export type DomainId = "wedding" | "construction" | "launch" | "startup";

export type BlockId = "attention" | "moving" | "risks" | "focus";

export type DemoItem = {
  id: string;
  /** Phrasing variants — the rotation engine swaps these mid-loop. */
  variants: string[];
  /** Provenance — e.g. "from Tasks · Wedding 2026". */
  provenance: string;
  /** Plain-English reason chain shown when "Why this?" expands. */
  whyThis?: string[];
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
  /** Yesterday's briefing — shown when view toggles to Yesterday. */
  yesterdayBlocks: DemoBlock[];
  /** Item id whose phrasing swaps mid-loop. */
  swapItemId: string;
  /** Item id that the cursor inspects with "Why this?". */
  inspectItemId: string;
  /** Focus item id that gets the acknowledge gesture. */
  acknowledgeItemId: string;
};

export const DOMAIN_ORDER: DomainId[] = [
  "wedding",
  "construction",
  "launch",
  "startup",
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

const WEDDING_YESTERDAY: DemoBlock[] = [
  {
    id: "attention",
    label: BLOCK_LABEL.attention,
    dot: BLOCK_DOT.attention,
    items: [
      { id: "florist-y", provenance: "from Tasks · Wedding 2026", variants: ["Florist deposit has been held up since March 2"] },
      { id: "invitations-y", provenance: "from Tasks · Wedding 2026", variants: ["Invitations are 13 days overdue"] },
    ],
  },
  {
    id: "moving",
    label: BLOCK_LABEL.moving,
    dot: BLOCK_DOT.moving,
    items: [
      { id: "catering-y", provenance: "from Tasks · Wedding 2026", variants: ["Catering tasting on track for Friday"] },
      { id: "rsvps-y", provenance: "from Tasks · Wedding 2026", variants: ["Save-the-dates landed at 92 confirmed RSVPs"] },
      { id: "venue-y", provenance: "from Tasks · Wedding 2026", variants: ["Venue contract signed three weeks ahead of plan"] },
    ],
  },
  {
    id: "risks",
    label: BLOCK_LABEL.risks,
    dot: BLOCK_DOT.risks,
    items: [
      { id: "music-y", provenance: "from Tasks · Wedding 2026", variants: ["Music supplier hasn't replied in 8 days"] },
      { id: "honeymoon-y", provenance: "from Tasks · Wedding 2026", variants: ["Honeymoon flights still unbooked at 48 days out"] },
    ],
  },
  {
    id: "focus",
    label: BLOCK_LABEL.focus,
    dot: BLOCK_DOT.focus,
    items: [
      { id: "florist-y-focus", provenance: "yesterday's priority", variants: ["Chase florist for status"] },
      { id: "rsvps-y-focus", provenance: "by Wednesday", variants: ["Close out RSVP follow-ups"] },
      { id: "music-y-focus", provenance: "this week", variants: ["Chase music supplier"] },
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

const CONSTRUCTION_YESTERDAY: DemoBlock[] = [
  {
    id: "attention",
    label: BLOCK_LABEL.attention,
    dot: BLOCK_DOT.attention,
    items: [
      { id: "windows-y", provenance: "from Tasks · Oak House", variants: ["Windows on backorder since March 3"] },
      { id: "planning-y", provenance: "from Tasks · Oak House", variants: ["Planning amendment is 10 days overdue"] },
    ],
  },
  {
    id: "moving",
    label: BLOCK_LABEL.moving,
    dot: BLOCK_DOT.moving,
    items: [
      { id: "electrical-y", provenance: "from Tasks · Oak House", variants: ["Electrical first-fix scheduled for Friday"] },
      { id: "frame-y", provenance: "from Tasks · Oak House", variants: ["Frame raised three days ahead of plan"] },
    ],
  },
  {
    id: "risks",
    label: BLOCK_LABEL.risks,
    dot: BLOCK_DOT.risks,
    items: [
      { id: "plumber-y", provenance: "from Tasks · Oak House", variants: ["Plumber hasn't replied in 6 days"] },
      { id: "weather-y", provenance: "from Tasks · Oak House", variants: ["Plaster scheduled on a forecast rain week"] },
    ],
  },
  {
    id: "focus",
    label: BLOCK_LABEL.focus,
    dot: BLOCK_DOT.focus,
    items: [
      { id: "windows-y-focus", provenance: "yesterday's priority", variants: ["Chase window supplier"] },
      { id: "council-y-focus", provenance: "by Friday", variants: ["Phone council for planning update"] },
    ],
  },
];

// ── Launch pack ────────────────────────────────────────────────────────────
const LAUNCH_TODAY: DemoBlock[] = [
  {
    id: "attention",
    label: BLOCK_LABEL.attention,
    dot: BLOCK_DOT.attention,
    items: [
      {
        id: "exports",
        provenance: "from Tasks · April Release",
        variants: [
          "PDF export held up since March 11",
          "Export work hasn't moved in 18 days",
          "Exports need owner sign-off before they can ship",
        ],
        whyThis: [
          "No commits to the export branch in 18 days.",
          "Blocked on a design review that hasn't been scheduled.",
          "Threshold crossed → surfaced for attention.",
        ],
      },
      {
        id: "billing",
        provenance: "from Tasks · April Release",
        variants: ["Billing rewrite is 9 days behind sprint plan"],
        whyThis: ["Sprint plan called for shipment 9 days ago.", "Two open PRs awaiting review."],
      },
      {
        id: "search",
        provenance: "from Tasks · April Release",
        variants: ["Search beta has 4 unresolved bug reports"],
        whyThis: ["4 open issues filed in the last 7 days.", "All marked P1 or P2."],
      },
    ],
    overflow: [
      { id: "docs", text: "Release notes still need owner copy" },
      { id: "perf", text: "Perf budget regressed 6% last week" },
    ],
  },
  {
    id: "moving",
    label: BLOCK_LABEL.moving,
    dot: BLOCK_DOT.moving,
    items: [
      { id: "share", provenance: "from Tasks · April Release", variants: ["Public share links shipped two days early"] },
      { id: "perf2", provenance: "from Tasks · April Release", variants: ["Performance pass came in 18% faster than the goal"] },
    ],
  },
  {
    id: "risks",
    label: BLOCK_LABEL.risks,
    dot: BLOCK_DOT.risks,
    items: [
      { id: "api", provenance: "from Tasks · April Release", variants: ["Public API v1 spec hasn't been touched in 12 days"] },
      { id: "mobile", provenance: "from Tasks · April Release", variants: ["Mobile read-only depends entirely on one engineer"] },
      { id: "comms", provenance: "from Tasks · April Release", variants: ["Customer comms plan not started — 21 days out"] },
    ],
  },
  {
    id: "focus",
    label: BLOCK_LABEL.focus,
    dot: BLOCK_DOT.focus,
    items: [
      { id: "exports-focus", provenance: "today's priority", variants: ["Unblock PDF exports with owner today"] },
      { id: "billing-focus", provenance: "by Friday", variants: ["Recover billing rewrite slippage by Friday"] },
      { id: "api-focus", provenance: "this week", variants: ["Restart API spec drafting this week"] },
    ],
  },
];

const LAUNCH_YESTERDAY: DemoBlock[] = [
  {
    id: "attention",
    label: BLOCK_LABEL.attention,
    dot: BLOCK_DOT.attention,
    items: [
      { id: "exports-y", provenance: "from Tasks · April Release", variants: ["PDF export held up since March 11"] },
      { id: "billing-y", provenance: "from Tasks · April Release", variants: ["Billing rewrite is 8 days behind sprint plan"] },
    ],
  },
  {
    id: "moving",
    label: BLOCK_LABEL.moving,
    dot: BLOCK_DOT.moving,
    items: [
      { id: "search-y", provenance: "from Tasks · April Release", variants: ["Search beta opened to 200 testers"] },
      { id: "share-y", provenance: "from Tasks · April Release", variants: ["Public share links shipped two days early"] },
    ],
  },
  {
    id: "risks",
    label: BLOCK_LABEL.risks,
    dot: BLOCK_DOT.risks,
    items: [
      { id: "api-y", provenance: "from Tasks · April Release", variants: ["Public API v1 spec hasn't been touched in 11 days"] },
      { id: "comms-y", provenance: "from Tasks · April Release", variants: ["Customer comms plan not started — 22 days out"] },
    ],
  },
  {
    id: "focus",
    label: BLOCK_LABEL.focus,
    dot: BLOCK_DOT.focus,
    items: [
      { id: "exports-y-focus", provenance: "yesterday's priority", variants: ["Push exports unblock"] },
      { id: "api-y-focus", provenance: "by Friday", variants: ["Schedule API spec working session"] },
    ],
  },
];

// ── Startup pack ───────────────────────────────────────────────────────────
const STARTUP_TODAY: DemoBlock[] = [
  {
    id: "attention",
    label: BLOCK_LABEL.attention,
    dot: BLOCK_DOT.attention,
    items: [
      {
        id: "compliance",
        provenance: "from Tasks · Q2 plan",
        variants: [
          "SOC 2 readiness held up since March 8",
          "Compliance hasn't moved in 14 days",
          "SOC 2 needs the auditor scheduled before April 1",
        ],
        whyThis: [
          "No status update in 14 days.",
          "April 1 audit deadline is hard.",
          "Threshold crossed → surfaced for attention.",
        ],
      },
      {
        id: "pricing",
        provenance: "from Tasks · Q2 plan",
        variants: ["Pricing decision is 6 days overdue"],
        whyThis: ["Decision due 6 days ago.", "Public beta marketing is waiting on this."],
      },
      {
        id: "alpha",
        provenance: "from Tasks · Q2 plan",
        variants: ["Alpha cohort has 3 customers stuck on activation"],
        whyThis: ["3 customers reported activation failures in the last 4 days.", "Onboarding completion rate down 22%."],
      },
    ],
    overflow: [
      { id: "hire", text: "Engineer 2 hire offer pending acceptance" },
      { id: "investor", text: "Investor update letter not started" },
    ],
  },
  {
    id: "moving",
    label: BLOCK_LABEL.moving,
    dot: BLOCK_DOT.moving,
    items: [
      { id: "seed", provenance: "from Tasks · Q2 plan", variants: ["Seed round closed 12 days ahead of target"] },
      { id: "retention", provenance: "from Tasks · Q2 plan", variants: ["First-week retention is up 22% over last month"] },
    ],
  },
  {
    id: "risks",
    label: BLOCK_LABEL.risks,
    dot: BLOCK_DOT.risks,
    items: [
      { id: "single", provenance: "from Tasks · Q2 plan", variants: ["72% of customer-facing work runs through one engineer"] },
      { id: "beta-plan", provenance: "from Tasks · Q2 plan", variants: ["Public beta plan not started — 42 days out"] },
      { id: "metrics", provenance: "from Tasks · Q2 plan", variants: ["Investor metrics dashboard hasn't been updated in 8 days"] },
    ],
  },
  {
    id: "focus",
    label: BLOCK_LABEL.focus,
    dot: BLOCK_DOT.focus,
    items: [
      { id: "compliance-focus", provenance: "today's priority", variants: ["Schedule SOC 2 auditor call today"] },
      { id: "pricing-focus", provenance: "by Friday", variants: ["Decide pricing with the team by Friday"] },
      { id: "alpha-focus", provenance: "this week", variants: ["Unblock the 3 stuck alpha customers"] },
    ],
  },
];

const STARTUP_YESTERDAY: DemoBlock[] = [
  {
    id: "attention",
    label: BLOCK_LABEL.attention,
    dot: BLOCK_DOT.attention,
    items: [
      { id: "compliance-y", provenance: "from Tasks · Q2 plan", variants: ["SOC 2 readiness held up since March 8"] },
      { id: "pricing-y", provenance: "from Tasks · Q2 plan", variants: ["Pricing decision is 5 days overdue"] },
    ],
  },
  {
    id: "moving",
    label: BLOCK_LABEL.moving,
    dot: BLOCK_DOT.moving,
    items: [
      { id: "alpha-y", provenance: "from Tasks · Q2 plan", variants: ["Alpha cohort grew to 9 active customers"] },
      { id: "seed-y", provenance: "from Tasks · Q2 plan", variants: ["Seed round closed 12 days ahead of target"] },
      { id: "retention-y", provenance: "from Tasks · Q2 plan", variants: ["First-week retention is up 20% over last month"] },
    ],
  },
  {
    id: "risks",
    label: BLOCK_LABEL.risks,
    dot: BLOCK_DOT.risks,
    items: [
      { id: "single-y", provenance: "from Tasks · Q2 plan", variants: ["72% of customer-facing work runs through one engineer"] },
      { id: "beta-plan-y", provenance: "from Tasks · Q2 plan", variants: ["Public beta plan not started — 43 days out"] },
    ],
  },
  {
    id: "focus",
    label: BLOCK_LABEL.focus,
    dot: BLOCK_DOT.focus,
    items: [
      { id: "compliance-y-focus", provenance: "yesterday's priority", variants: ["Pin down SOC 2 auditor"] },
      { id: "pricing-y-focus", provenance: "by Wednesday", variants: ["Bring pricing options to leadership"] },
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
    acknowledgeItemId: "headcount-focus",
    blocks: WEDDING_TODAY,
    yesterdayBlocks: WEDDING_YESTERDAY,
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
    acknowledgeItemId: "wiring-focus",
    blocks: CONSTRUCTION_TODAY,
    yesterdayBlocks: CONSTRUCTION_YESTERDAY,
  },
  launch: {
    id: "launch",
    label: "Product launch",
    description: "a team that needs the lay of the land before the morning sync",
    workspaceName: "April release",
    workspaceEyebrow: "Wednesday · 06:00",
    greeting: "Good morning.",
    swapItemId: "exports",
    inspectItemId: "exports",
    acknowledgeItemId: "billing-focus",
    blocks: LAUNCH_TODAY,
    yesterdayBlocks: LAUNCH_YESTERDAY,
  },
  startup: {
    id: "startup",
    label: "Startup plan",
    description: "a founder who needs to know what slipped overnight",
    workspaceName: "Q2 plan",
    workspaceEyebrow: "Wednesday · 06:00",
    greeting: "Good morning.",
    swapItemId: "compliance",
    inspectItemId: "compliance",
    acknowledgeItemId: "pricing-focus",
    blocks: STARTUP_TODAY,
    yesterdayBlocks: STARTUP_YESTERDAY,
  },
};
