# Signal · PRODUCT.md

**Locked product definition.** This document defines what Signal *is*, who it's for, what it ships, and — critically — *how the briefing is generated* without crossing into AI-marketing territory. It is the single source of truth for product decisions in this repo. When this document and the live site disagree, fix this document first if the document is wrong; otherwise fix the site.

Drafted in Plan 1 · Cycle 1.1 (Strategic Foundation). Companion to BRAND.md.

> **Progressive-depth amendment · 2026-07-13.** The approved Signal analytics direction in sections 3-11 supersedes the older clauses that required four briefing blocks, limited the read model to Tasks, prohibited every graph or metric card, prohibited all customization, or made curated prose the only permitted narrative path. The surface promise has not changed: Signal opens on zero to three things that genuinely need the user now. Overview, Trends, and Evidence exist beneath that promise. They do not turn Signal into a generic dashboard.

---

## 1 · Position

Signal is **attention clarity**. Where Notes captures the work, Tasks runs it, and Timeline explains where it is going, Signal tells you *what to do about it today*. It is one product in the Signal Studio suite. Its job is to read the connected state of work, surface the few things that need attention, and let the user inspect the facts underneath without changing products or losing context.

It is not a generic dashboard, productivity tracker, or employee scorecard. The briefing replaces the dashboard as the first screen. Overview, Trends, and Evidence add depth only when the user asks for it.

---

## 2 · Audience

The same 80% the suite serves: people running real work who do not work in tech and do not have a project manager. In Signal specifically:

- The freelance designer with eleven concurrent client projects who needs a Monday morning read.
- The wedding planner running six weddings in different stages who needs to know which one needs her today.
- The trades operator with crews on four sites who needs to know which site is about to slip.
- The small-business owner whose work spans operations, sales, and people, all without a status meeting.
- The teacher coordinating a school production across staff, students, and parents.

What unites them: they are *the person* the work routes through. A bad day is not "low velocity" — it is missing the thing that mattered most because it was buried under the things that mattered less.

Banned framings: "engineering teams", "product orgs", "stakeholders", "leadership". If a sentence in this product would not make sense to a wedding planner, the sentence is wrong.

---

## 3 · The promise

> A briefing, not a dashboard. Two minutes a day. Plain English. Everything important. Nothing distracting.

The promise has four parts and they are non-negotiable:

1. **Briefing first.** Signal opens on zero to three plain-English observations. Never a number without a conclusion. Never a graph without a written account of what it means.
2. **Compressed, not padded.** A list of every open task is not a briefing. Signal suppresses the rest and does not manufacture a third concern to fill the page.
3. **Depth on demand.** Briefing answers what needs attention now. Overview answers what is true across the selected workspace or project. Trends answers what is changing. Evidence shows the Notes, Tasks, decisions, dependencies, milestones, and events behind the claim.
4. **Useful before customization.** Recommended views appear without setup. A user may later hide, pin, or reorder approved cards. They may not write rules, tune risk thresholds, build a blank grid, or invent formulas.

If Briefing stops being the default, if the page becomes a wall of charts, if the user has to design the Overview before it is useful, or if a claim cannot show its evidence, the product has drifted out of Signal.

---

## 4 · The product shape

Signal has one default and three progressive layers:

| Layer | Question | Contract |
|---|---|---|
| **Briefing** | What genuinely needs my attention now? | Zero to three ranked observations. Every observation has a useful action and can open Evidence. |
| **Overview** | What is true across this workspace or project right now? | A recommended composition of summary, comparable projects, one primary trend, and an actionable queue. Useful on first open. |
| **Trends** | What is changing over time? | One selected metric at a time, one primary visualization, a plain-language interpretation, comparison basis, coverage, and contributing records. |
| **Evidence** | Why did Signal say this? | A consistent right-side drawer with the deterministic rule, comparison basis, contributing source records, scope, period, freshness, coverage, and actions. |

Briefing remains the default route. Workspace or project scope, period, owner, status, selected metric, and the open Evidence item persist when the user moves between Signal views or uses browser back and forward.

### 4.1 Briefing contract

Each observation includes a conclusion-led title, a concise explanation, why it matters, scope, period, confidence or coverage when needed, evidence count, primary action, secondary Evidence or Trends action, and freshness. A repeated observation may be suppressed or combined with another observation about the same underlying work.

On a healthy day Signal says:

> Nothing needs you right now.<br>
> Work is moving normally.

Signal may name the next meaningful milestone or review date. It does not manufacture concern.

### 4.2 Overview contract

Overview is assembled for the selected scope. Workspace scope prefers projects needing attention, the next milestone, work completed in the current period, a bounded projects table, one useful trend, and an actionable queue. Project scope emphasizes current state, the next milestone, completion pace, decisions, waiting work, ownership gaps, and deadline movement. Cards appear only when their data and context justify them.

### 4.3 Trends contract

Trends shows one metric at a time. Initial periods are four weeks, twelve weeks, six months, and twelve months. It may break down by project, owner, status, or work type. It never interpolates missing history. When coverage is too thin, the result is **Not enough history yet** with a direct explanation of what will appear later.

### 4.4 Customization boundary

Normal mode is for reading, filtering, opening Evidence, and taking action. Customize mode may hide, pin, reorder, or restore recommended cards. Version one does not include arbitrary grids, resizing, formulas, authored queries, nested filter builders, generated dashboards, or public embeds.

Daily, weekly, and launch cadences may still use the Briefing artifact. The in-product Briefing is capped at three observations; email and shareable variants must preserve the same compression and evidence honesty.

---

## 5 · The three pillars (mechanism)

Internally the product runs on three pillars. The marketing site already names these; this section locks what they actually mean.

### 5.1 Attention Engine

A versioned set of deterministic metrics and rules scans only the work the current user may access. It produces Briefing candidates, Overview cards, Trends series, project states, and Evidence records from the same normalized facts. Thresholds and weights live in code, not in the UI.

**Initial metric catalogue:**

| Metric | Deterministic definition |
|---|---|
| Work completed | Work entering a terminal state during the selected period. Use the canonical completion timestamp when transition history is unavailable, and disclose that fallback. |
| Open overdue work | Non-terminal work with a due date before the relevant current time, using workspace or site timezone semantics. |
| Open work age | Time from creation to now for non-terminal work. |
| Stalled work | Non-terminal work with no meaningful activity for the configured interval. Cosmetic metadata edits do not count as progress. |
| Blocked work | Explicitly blocked work or work with an unresolved dependency. Explicit and inferred blocking remain distinguishable. |
| Unowned work | Active non-terminal work without an owner. |
| Completion pace change | Current-period completions compared with the median of the prior three equal periods. Suppressed when history is insufficient. |
| Milestone movement | Count and net movement of stored milestone-date changes. No prior date is inferred. |
| Open decisions | Structured decisions whose current state is open or unresolved. |
| Follow-up completion | Structured follow-ups completed or remaining in the selected period. |
| Workload concentration | Distribution of active work by owner. It is not an individual productivity measure. |
| Cross-product milestone risk | An upcoming milestone linked to blocked or overdue Tasks, open decisions, or unresolved dependencies. Every contributing record is exposed. |

**Candidate detection and ranking:** remove candidates with inadequate evidence; suppress repeated low-value candidates; combine candidates about the same underlying issue; require a useful action; then rank by impact, urgency, confidence, and recency. Briefing takes the first zero to three. Project state is limited to **On track**, **Watch**, or **Needs attention**, always with explicit reasons. No black-box score is calculated or shown.

Every metric and rule carries a version. Adding or changing one is a reviewed code change. This is a feature, not a limitation: "Why did I see this?" must always have a deterministic answer.

### 5.2 Plain-English Insights

Once a trigger fires, it produces an *insight* — one sentence describing what is happening. This is where the briefing's voice lives.

**Mechanism: deterministic rules + curated prose library.** Each trigger has a hand-written set of 4–8 phrasings. When the trigger fires, one phrasing is selected (rotated to avoid repetition, not random). Variables (project name, assignee, count, date) are slotted in.

**Example — `inactive-project` phrasings library:**
- *"`{project}` has had no activity in `{days}` days."*
- *"Nothing has moved on `{project}` in over a week."*
- *"`{project}` has gone quiet — last update `{relative-date}`."*
- *"`{project}` is still open but hasn't moved since `{date}`."*

**Voice rules per phrasing** (enforced in code review of the prose library):
- Active voice. "`{project}` has slowed" not "Slowdown detected on `{project}`".
- Cause included where it can be. "Blocked because `{reason}`" beats "Blocked".
- No FYI items. If a sentence is informational with no consequence, the trigger should not fire.
- Calibrated confidence. Triggers either fire or they don't — no "may have", "possibly", "could be". If the trigger is uncertain, raise its threshold.
- No metric names in the sentence. "Sprint velocity dropped 14%" never. "This project is slowing down" yes.

Curated templates remain the required fallback and the default path. Section 9 defines the narrow optional narrative boundary.

### 5.3 Priority Compression

The deliberate act of *not* surfacing things. After triggers fire and insights are written, compression decides what makes it into the briefing and what gets dropped.

**Compression rules:**
- Hard cap of three observations across the entire Briefing, not three per category.
- Zero is a valid and successful result.
- Candidates without adequate evidence, a useful action, or permission-safe source records do not surface.
- Candidates about the same underlying work are combined before ranking.
- Repeated low-value observations are de-emphasized and then suppressed unless severity or evidence materially changes.
- Suppressed observations do not move into an "and more" list. Overview and Trends provide deliberate depth; Briefing does not leak the candidate queue.

**The discipline:** a briefing that lists "and 14 more items" is no longer a briefing. The compression is the product.

**Marketing hero contract:** Three Things Only. The hero may show many raw candidate items, but the motion must visibly suppress most of them and resolve into a readable Daily Signal with one receipt sentence and no more than three observations. The final state is the briefing, not a chart. Reduced motion renders the briefing directly.

---

## 6 · What it reads

Signal normalizes facts from the three source products without copying their canonical records into a second system.

- **Notes provider:** note identifier, workspace and project, structured decisions and their state, structured follow-ups and owners, open questions, links to Tasks or milestones, timestamps, and the existing deep link. Raw Note bodies are not required for canonical metrics and are not stored in analytics.
- **Tasks provider:** task identifier, workspace and project, status and terminal state, owners, dates, creation and completion times, meaningful activity, explicit blocking, unresolved dependencies, existing priority where available, and the existing deep link.
- **Timeline provider:** milestone identifier, workspace and project, current and previously stored dates, dependencies, state, associated Tasks and decisions, and the existing deep link.

Adapters enforce the existing membership and record permissions before data reaches metrics. Stable source identifiers connect records across products. Signal stores only bounded derived preferences, snapshots, or cache entries when the current query path needs them; it does not create shadow Notes, Tasks, decisions, or milestones.

Provider coverage is allowed to be partial. A metric that its sources cannot support returns explicit coverage metadata or **Not enough history yet**. It never substitutes demo data, infers missing historical dates, or treats an unavailable provider as an empty healthy workspace.

**How the current Tasks adapter maps data into Signal's normalized read model** (locked Cycle 6.3 and retained as a compatibility fallback):

Tasks's actual schema has no `projects` table — work segmentation lives in the free-form `tags` array on each task. Signal translates this into its own `ProjectRead` shape using the rule: **each unique tag in a workspace = one Signal "project"**. Specifically:

- `ProjectRead.slug` = the tag string verbatim (e.g. `"claire-wedding"`).
- `ProjectRead.name` = title-cased display version (e.g. `"Claire's wedding"`).
- `ProjectRead.members` = union of assignees across all tasks bearing that tag.
- `ProjectRead.lastActivityAt` = max `updatedAt` across tasks bearing the tag.
- `ProjectRead.deadline` = `null` (Tasks doesn't model project-level deadlines; Signal doesn't infer them).
- A task with multiple tags belongs to multiple projects (`TaskRead.projectSlugs: string[]`). Project-scoped triggers iterate `tasks.filter(t => t.projectSlugs.includes(project.slug))`. Workspace-level triggers see each task once.
- Tasks with no tags are excluded from project-scoped triggers but still feed workspace-level signals (overload, streak, momentum-positive at workspace level).

**Why tag-as-project, not adding `projects` to Tasks:** adding a Projects table would force a configuration step (create the Project for Claire's wedding) before users can capture work — directly contradicting Tasks's anti-configuration positioning per BRAND.md §2.2 ("Configuration tax"). Tags already do the job, the user already understands them, and they get added inline at three-second-capture speed. Signal is the layer that flexes to read what's there, not Tasks.

**Lane → Status canonicalization** (locked Cycle 6.4):

Tasks's canonical lane vocabulary is `"todo" | "doing" | "review" | "done"`. Signal's `Status` enum is `"next" | "in-flight" | "blocked" | "shipped" | "refused"`. The mapping is one-way and lives in `tasksDbSource`:

| Tasks lane | Signal status |
|---|---|
| `todo` | `next` |
| `doing` | `in-flight` |
| `review` | `in-flight` |
| `done` | `shipped` |

Two derivation rules sit on top:

- **`blocked` is not lane-derived.** Tasks models blocking via the `blockedBy` array, not via a lane. A task is `blocked` when `blockedBy.length > 0 && lane !== "done"`.
- **`refused` does not materialize from Tasks data.** Tasks has no rejection state in v1. Triggers must not assume `refused` appears in real WorkRead snapshots — it remains in the Status enum for forward-compat with future sources.

Unknown lanes (if Tasks adds vocabulary) log once and map to `next` defensively. Triggers never see Tasks's vocabulary; they read `Status` only.

**Out of scope for the first progressive-depth release** (do not promise on the marketing site):
- Calendar reads.
- Email reads.
- Slack / Teams reads.
- Unstructured document-body analysis.
- External project tools.

---

## 7 · What it isn't (locked refusals)

These are not "future considerations". These are decisions to *never* build. Each is a sentence the product team can point at when the request comes up.

- **Not a separate dashboard product.** Analytics depth lives inside Signal. Briefing is the default. Overview is recommended, not blank. Trends shows one question at a time. Evidence explains the claim.
- **Not a wall of metrics.** No mosaic of unrelated mini-charts, ornamental gauges, chart junk, or black-box health score. A graph earns its place only when a written conclusion, coverage, and source records accompany it.
- **Not productivity tracking.** No per-person score, leaderboard, completion-rate ranking, or employee-performance label. Workload distribution describes the work, not a person's worth.
- **Not freely configurable.** No rule editor, threshold slider, arbitrary widget composer, custom formula, authored query language, or generated dashboard. Hide, pin, reorder, and restore are the complete first-release customization boundary.
- **Not a notification stream.** Briefings fire on a fixed cadence. The product does not interrupt during the day. It does not push. It does not ping.
- **Not a permission bypass.** Signal inherits workspace, project, membership, tenant, and source-record permissions. Evidence never reveals a record the viewer cannot open.
- **Not AI-marketed.** Even if a future cycle introduces an LLM somewhere in the pipeline, the marketing surface never says "AI", "intelligent", "smart", "agent", "copilot". The voice rules in BRAND.md govern.
- **Not false real-time.** Every view states when it was calculated. Stale data is visibly stale. A refresh control cannot imply that unavailable source history suddenly exists.

---

## 8 · Success and anti-success

**The progressive-depth release succeeds when:**
- A real user reads three Daily Signals in a row and acts on at least one grounded observation.
- Briefing returns zero to three observations and the healthy empty state feels like success.
- The user can move from a conclusion to its Evidence, then to a real Note, Task, or milestone, without losing Signal context.
- Overview is useful before the user customizes it.
- Trends refuses to make a confident claim when history is too thin.
- The same scope and permission boundary produces consistent facts across Briefing, Overview, Trends, and Evidence.
- The user can describe Signal in one sentence without using "AI", "productivity score", or "dashboard builder".

**The release has failed if:**
- Briefing becomes a teaser for a dense metrics page rather than a complete first answer.
- Signal pads the Briefing, invents history, hides weak coverage, or labels an unavailable provider as healthy.
- An observation cannot show the records and rule that produced it.
- Users must configure cards before Overview makes sense.
- Any view crosses a workspace, tenant, project, or source-record permission boundary.
- The prose sounds confident when the facts are not.

---

## 9 · Deterministic core and narrative boundary

Canonical metrics, candidate detection, ranking, suppression, project state, comparisons, coverage, and Evidence are deterministic. A narrative provider never changes a value, selects a candidate, invents a cause, overrides a permission, or turns weak coverage into confidence.

Curated templates remain the default and required fallback. If the repository's existing server-side provider abstraction is enabled later, it may only:

- phrase verified facts more naturally
- summarize the bounded Evidence already returned to the user
- draft a concise weekly review from those facts

The server sends only the minimum verified fields needed for that wording. Raw Note bodies are excluded unless a separate, explicit, permitted use case requires them. Provider keys never reach browser code. Responses are validated, time-bounded, and cached only within the same permission scope. Timeout, invalid output, missing consent, missing configuration, or provider failure returns the curated deterministic wording.

The marketing refusal remains absolute: Signal is never sold as an AI feature. The system works fully with no narrative provider configured.

---

## 10 · Implementation map

The accepted implementation and release contract lives in `docs/ADR-2026-07-13-SIGNAL-PROGRESSIVE-ANALYTICS.md`.

| Concern | Boundary |
|---|---|
| Source facts | Provider adapters around canonical Notes, Tasks, and Timeline data. No shadow records. |
| Analytics domain | Normalized facts, versioned metrics, versioned rules, ranking, coverage, and Evidence assembly. |
| Product delivery | Existing authenticated Signal shell and route system. Briefing is the default; Overview and Trends preserve URL context. |
| History | Stored source events where available, plus bounded, versioned prospective metric snapshots in Signal's isolated additive migration stream. Never synthesize history. |
| Preferences | Signal's application-state database, scoped to the current user and workspace and limited to analytics card order, pin, and hide state. |
| Release | One centralized feature flag. Production is off when unset; non-production is on when unset for review and may be explicitly disabled. Promotion still requires permission, coverage, and live-data proof. |

---

## 11 · Resolved operating decisions and honest gaps

1. **No-signal day is resolved.** Show the healthy empty state. Never skip the in-product page or manufacture concern.
2. **First-day history is resolved.** Briefing may use current-state rules that have enough evidence. Trends says **Not enough history yet** until real history exists.
3. **Context is resolved.** Workspace or project scope persists across Signal views and, where the existing suite links support it, when switching products.
4. **Customization is resolved.** Hide, pin, reorder, restore. Nothing more in the first release.
5. **History remains source-dependent.** Milestone movement and transition-based metrics ship only where canonical history exists. Versioned metric snapshots may build bounded history prospectively; they cannot repair the past.
6. **Cross-product coverage remains environment-dependent.** A missing provider is shown as partial or unavailable, never as zero.
7. **Email remains a Briefing delivery channel.** Overview, Trends, and Evidence are in-product depth; email does not become a portable dashboard.

---

## 12 · This document is a contract

When the live marketing site says one thing and this document says another, one of them is wrong. The fix is not to leave them inconsistent.

When an implementation wants to ship something this document forbids, it does not silently break the contract. It changes this document first, records the reason, and then ships against the amended contract.

When this document is wrong, fix it here first. Then the code. Then the marketing site.

---

*Locked 2026-05-09 in Plan 1 · Cycle 1.1 (Strategic Foundation). Progressively amended 2026-07-13 by the accepted Signal analytics direction. Companion documents: BRAND.md, docs/COLLABORATION_LOOP.md, and docs/ADR-2026-07-13-SIGNAL-PROGRESSIVE-ANALYTICS.md.*
