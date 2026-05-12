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
  /** Workspace name shown in the demo's top chrome. */
  workspaceName: string;
  /** Eyebrow shown above the workspace name. */
  workspaceEyebrow: string;
  /** Greeting line for the briefing. */
  greeting: string;
  blocks: DemoBlock[];
  /** Item id whose phrasing swaps mid-loop. */
  swapItemId: string;
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

export const DOMAINS: Record<DomainId, DomainPack> = {
  wedding: {
    id: "wedding",
    label: "Wedding plan",
    description:
      "a planner who needs the day-by-day signal instead of a board to check",
    workspaceName: "Wedding 2026",
    workspaceEyebrow: "Wednesday · 06:00",
    greeting: "Good morning.",
    swapItemId: "florist",
    blocks: [
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
          },
          {
            id: "catering",
            provenance: "from Tasks · Wedding 2026",
            variants: ["Catering tasting needs a final headcount by Friday"],
          },
          {
            id: "invitations",
            provenance: "from Tasks · Wedding 2026",
            variants: ["Invitations are 14 days overdue"],
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
          {
            id: "rsvps",
            provenance: "from Tasks · Wedding 2026",
            variants: ["Save-the-dates landed at 96 confirmed RSVPs"],
          },
          {
            id: "venue",
            provenance: "from Tasks · Wedding 2026",
            variants: ["Venue contract signed three weeks ahead of plan"],
          },
        ],
      },
      {
        id: "risks",
        label: BLOCK_LABEL.risks,
        dot: BLOCK_DOT.risks,
        items: [
          {
            id: "music",
            provenance: "from Tasks · Wedding 2026",
            variants: ["Music supplier hasn't replied in 9 days"],
          },
          {
            id: "hair",
            provenance: "from Tasks · Wedding 2026",
            variants: ["Hair-and-makeup trial overlaps with rehearsal dinner"],
          },
          {
            id: "honeymoon",
            provenance: "from Tasks · Wedding 2026",
            variants: ["Honeymoon flights still unbooked at 47 days out"],
          },
        ],
      },
      {
        id: "focus",
        label: BLOCK_LABEL.focus,
        dot: BLOCK_DOT.focus,
        items: [
          {
            id: "florist-focus",
            provenance: "today's priority",
            variants: ["Confirm florist deposit Monday"],
          },
          {
            id: "headcount-focus",
            provenance: "by Friday",
            variants: ["Send catering headcount by Friday"],
          },
          {
            id: "music-focus",
            provenance: "this week",
            variants: ["Chase music supplier this week"],
          },
        ],
      },
    ],
  },
  construction: {
    id: "construction",
    label: "Building project",
    description: "a contractor who wants the morning brief instead of a daily standup",
    workspaceName: "Oak House extension",
    workspaceEyebrow: "Wednesday · 06:00",
    greeting: "Good morning.",
    swapItemId: "windows",
    blocks: [
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
          },
          {
            id: "electrical",
            provenance: "from Tasks · Oak House",
            variants: ["Electrical first-fix needs a final wiring plan by Friday"],
          },
          {
            id: "planning",
            provenance: "from Tasks · Oak House",
            variants: ["Planning amendment is 11 days overdue"],
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
          {
            id: "frame",
            provenance: "from Tasks · Oak House",
            variants: ["Frame raised three days ahead of plan"],
          },
          {
            id: "demo",
            provenance: "from Tasks · Oak House",
            variants: ["Demolition came in under budget"],
          },
        ],
      },
      {
        id: "risks",
        label: BLOCK_LABEL.risks,
        dot: BLOCK_DOT.risks,
        items: [
          {
            id: "plumber",
            provenance: "from Tasks · Oak House",
            variants: ["Plumber hasn't replied in 7 days"],
          },
          {
            id: "weather",
            provenance: "from Tasks · Oak House",
            variants: ["Plaster scheduled on a forecast rain week"],
          },
          {
            id: "owner",
            provenance: "from Tasks · Oak House",
            variants: ["Owner hasn't approved kitchen layout — 14 days out"],
          },
        ],
      },
      {
        id: "focus",
        label: BLOCK_LABEL.focus,
        dot: BLOCK_DOT.focus,
        items: [
          {
            id: "windows-focus",
            provenance: "today's priority",
            variants: ["Call window supplier this morning"],
          },
          {
            id: "wiring-focus",
            provenance: "by Friday",
            variants: ["Sign off wiring plan with electrician"],
          },
          {
            id: "owner-focus",
            provenance: "this week",
            variants: ["Get kitchen layout approved by owner"],
          },
        ],
      },
    ],
  },
  launch: {
    id: "launch",
    label: "Product launch",
    description: "a team that needs the lay of the land before the morning sync",
    workspaceName: "April release",
    workspaceEyebrow: "Wednesday · 06:00",
    greeting: "Good morning.",
    swapItemId: "exports",
    blocks: [
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
          },
          {
            id: "billing",
            provenance: "from Tasks · April Release",
            variants: ["Billing rewrite is 9 days behind sprint plan"],
          },
          {
            id: "search",
            provenance: "from Tasks · April Release",
            variants: ["Search beta has 4 unresolved bug reports"],
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
          {
            id: "share",
            provenance: "from Tasks · April Release",
            variants: ["Public share links shipped two days early"],
          },
          {
            id: "perf2",
            provenance: "from Tasks · April Release",
            variants: ["Performance pass came in 18% faster than the goal"],
          },
        ],
      },
      {
        id: "risks",
        label: BLOCK_LABEL.risks,
        dot: BLOCK_DOT.risks,
        items: [
          {
            id: "api",
            provenance: "from Tasks · April Release",
            variants: ["Public API v1 spec hasn't been touched in 12 days"],
          },
          {
            id: "mobile",
            provenance: "from Tasks · April Release",
            variants: ["Mobile read-only depends entirely on one engineer"],
          },
          {
            id: "comms",
            provenance: "from Tasks · April Release",
            variants: ["Customer comms plan not started — 21 days out"],
          },
        ],
      },
      {
        id: "focus",
        label: BLOCK_LABEL.focus,
        dot: BLOCK_DOT.focus,
        items: [
          {
            id: "exports-focus",
            provenance: "today's priority",
            variants: ["Unblock PDF exports with owner today"],
          },
          {
            id: "billing-focus",
            provenance: "by Friday",
            variants: ["Recover billing rewrite slippage by Friday"],
          },
          {
            id: "api-focus",
            provenance: "this week",
            variants: ["Restart API spec drafting this week"],
          },
        ],
      },
    ],
  },
  startup: {
    id: "startup",
    label: "Startup plan",
    description: "a founder who needs to know what slipped overnight",
    workspaceName: "Q2 plan",
    workspaceEyebrow: "Wednesday · 06:00",
    greeting: "Good morning.",
    swapItemId: "compliance",
    blocks: [
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
          },
          {
            id: "pricing",
            provenance: "from Tasks · Q2 plan",
            variants: ["Pricing decision is 6 days overdue"],
          },
          {
            id: "alpha",
            provenance: "from Tasks · Q2 plan",
            variants: ["Alpha cohort has 3 customers stuck on activation"],
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
          {
            id: "seed",
            provenance: "from Tasks · Q2 plan",
            variants: ["Seed round closed 12 days ahead of target"],
          },
          {
            id: "retention",
            provenance: "from Tasks · Q2 plan",
            variants: ["First-week retention is up 22% over last month"],
          },
        ],
      },
      {
        id: "risks",
        label: BLOCK_LABEL.risks,
        dot: BLOCK_DOT.risks,
        items: [
          {
            id: "single",
            provenance: "from Tasks · Q2 plan",
            variants: ["72% of customer-facing work runs through one engineer"],
          },
          {
            id: "beta-plan",
            provenance: "from Tasks · Q2 plan",
            variants: ["Public beta plan not started — 42 days out"],
          },
          {
            id: "metrics",
            provenance: "from Tasks · Q2 plan",
            variants: ["Investor metrics dashboard hasn't been updated in 8 days"],
          },
        ],
      },
      {
        id: "focus",
        label: BLOCK_LABEL.focus,
        dot: BLOCK_DOT.focus,
        items: [
          {
            id: "compliance-focus",
            provenance: "today's priority",
            variants: ["Schedule SOC 2 auditor call today"],
          },
          {
            id: "pricing-focus",
            provenance: "by Friday",
            variants: ["Decide pricing with the team by Friday"],
          },
          {
            id: "alpha-focus",
            provenance: "this week",
            variants: ["Unblock the 3 stuck alpha customers"],
          },
        ],
      },
    ],
  },
};
