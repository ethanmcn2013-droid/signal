# Signal · PRODUCT.md

**Locked product definition.** This document defines what Signal *is*, who it's for, what it ships, and — critically — *how the briefing is generated* without crossing into AI-marketing territory. It is the single source of truth for product decisions in this repo. When this document and the live site disagree, fix this document first if the document is wrong; otherwise fix the site.

Drafted in Plan 1 · Cycle 1.1 (Strategic Foundation). Companion to BRAND.md.

---

## 1 · Position

Signal is **attention clarity**. Where Tasks runs the work and Timeline explains the work, Signal tells you *what to do about the work today*. It is one product in the Signal Studio suite. Its job is to read the state of work and write a short briefing that says what needs attention, what is moving well, what is quietly at risk, and what to do next.

It is not a dashboard. It is not productivity tracking. It is not enterprise software. The briefing replaces the dashboard.

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

The promise has three parts and they are non-negotiable:

1. **Briefing, not data.** The output is sentences a person would write. Never numbers without a sentence around them. Never a graph without a written claim about what it means.
2. **Compressed, not complete.** A list of every open task is not a briefing. The briefing surfaces the small set that matters today and *explicitly suppresses* the rest.
3. **No configuration.** The user does not write rules, set thresholds, build dashboards, or pick widgets. They sign in and the briefing is there.

If any of these three drift, the product is no longer Signal — it has become a different category of product (a dashboard tool, a metrics platform, an alerting system) and is no longer brand-coherent.

---

## 4 · The artifact: the Daily Signal

The briefing has four blocks. Always four. Always in this order. The contents change; the structure does not.

| Block | Color dot | Job |
|---|---|---|
| **Needs attention** | `--status-flight` (#f59e0b) | Things actively costing time or money if left alone today. Blocked work, overload, missed deadlines, dependency failures. Two to three items, never more. |
| **Moving well** | `--status-shipped` (#10b981) | Quiet wins. Where momentum is. Calibrates the briefing against pure-bad-news fatigue. Two to three items. |
| **Quiet risks** | neutral grey (#71717a) | What is invisible but accumulating. Inactive projects, single points of failure, drift toward a deadline with no visible progress. The block dashboards miss. |
| **Suggested focus** | brand indigo (#4f46e5) | One to three actions worth doing today. Not a sorted to-do list. A considered read of where effort would do the most before the day ends. |

**Three cadences, one format.** The same four blocks render at three rhythms: Daily (every morning, two-minute read), Weekly (every Friday, ten-minute read with trend lines in plain sentences), Launch (before a ship event, fifteen-minute read of edges and outstanding items).

**Hard size limits.** Daily ≤ 350 words. Weekly ≤ 900 words. Launch ≤ 1200 words. These are caps, not targets — most days run shorter. The cap is the discipline.

---

## 5 · The three pillars (mechanism)

Internally the product runs on three pillars. The marketing site already names these; this section locks what they actually mean.

### 5.1 Attention Engine

A continuously-running set of deterministic detectors that scan the user's work data and surface candidate items for the briefing. Built-in. Not configurable. Not learned.

**Triggers in v1** (each maps to a Block when it fires):

| Trigger | Definition | Default Block |
|---|---|---|
| `blocked` | A task with status `blocked` for ≥ 2 days, or a task with an unresolved blocker referenced from another item | Needs attention |
| `overdue` | A task past its due date with no `done` status and no `pushed-to` date | Needs attention |
| `overload` | A single assignee holding > 8 active tasks (or > 60% of all active tasks in their workspace) | Needs attention |
| `dependency-stall` | A task waiting on another task that has had no activity for ≥ 5 days | Needs attention |
| `momentum-positive` | A project with ≥ 3 completions in the last 7 days *and* completion rate above its 28-day average | Moving well |
| `streak` | An assignee with ≥ 5 completions in the last 7 days | Moving well |
| `inactive-project` | An active project with no activity for ≥ 8 days | Quiet risks |
| `single-point-of-failure` | > 70% of a project's open work assigned to one person | Quiet risks |
| `slow-burn-deadline` | A project with a deadline ≤ 7 days away and < 30% of items closed | Quiet risks |
| `unresolved-recurring-block` | The same blocker pattern appears ≥ 3 times across the project's history | Quiet risks |

**Suggested focus** is computed differently — it is a ranked compression of *all* triggered items, not a separate trigger set. Ranking weights: cascade potential (does this block other work?), reversibility (is this irreversible if missed?), proximity (does it matter today vs this week?). Top 1–3 surface; the rest are suppressed.

**No learning. No model. No external API.** The detector set is code. Adding a trigger is a code change with a code review. This is a feature, not a limitation: it makes the briefing's behavior auditable and makes "why did I see this?" answerable in one sentence.

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

**Why curated prose, not LLM generation:** explored in Section 9 below. Locked decision: no LLM in the briefing path for v1.

### 5.3 Priority Compression

The deliberate act of *not* surfacing things. After triggers fire and insights are written, compression decides what makes it into the briefing and what gets dropped.

**Compression rules:**
- Hard cap of 3 items per block (Needs attention, Moving well, Quiet risks).
- Hard cap of 3 items in Suggested focus.
- If more than the cap qualify, rank by: (1) cascade potential, (2) consequence × reversibility, (3) proximity in time.
- Items below the cap are suppressed silently. They are *not* moved to a "more" section. They do not appear.
- A trigger that fires on the same item two days in a row is *de-emphasized* on day two: it stays in the block, but moves to the bottom and gets a shorter phrasing. On day three it is suppressed unless the underlying severity has worsened.

**The discipline:** a briefing that lists "and 14 more items" is no longer a briefing. The compression is the product.

**Marketing hero contract:** Three Things Only. The hero may show many raw candidate items, but the motion must visibly suppress most of them and resolve into a readable Daily Signal block with one receipt sentence and three briefing lines. The final state is the briefing, not a chart. Reduced motion renders the briefing directly.

---

## 6 · What it reads

In v1, Signal reads from **Signal Tasks** (the suite-internal data source). This is a deliberate scoping decision:

- It avoids needing to integrate with Asana / Linear / Jira / Trello / Notion at v1, which would multiply surface area.
- It strengthens the suite — Tasks becomes the data layer, Signal becomes the read layer.
- It validates the model end-to-end before opening to external sources.

**Read model** (locked for v1):
- Tasks: id, project, title, assignee, status, due date, blocker references, status history, activity timestamps.
- Projects: id, name, members, deadline, status, activity timestamps.
- Activity events: created, updated, status-changed, assigned, blocked, unblocked, commented (event timestamps only — no comment text in v1).

**How Tasks data maps to Signal's read model** (locked Cycle 6.3):

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

**Out of scope for v1** (deferred to a later cycle, do not promise on the marketing site):
- Calendar reads.
- Email reads.
- Slack / Teams reads.
- Document edit reads.
- Timeline reads. (The Timeline product is *direction* clarity; mixing its data into the daily briefing would conflate the two.)

---

## 7 · What it isn't (locked refusals)

These are not "future considerations". These are decisions to *never* build. Each is a sentence the product team can point at when the request comes up.

- **Not a dashboard.** No metric tiles. No graphs. No counters. No "score". Briefing is sentences.
- **Not productivity tracking.** No per-person scores. No leaderboards. No completion-rate rankings. Counting people does not make work move.
- **Not configurable.** No rule editor. No threshold sliders. No widget composer. If the product needs a settings page beyond account/billing/integrations, the product is wrong.
- **Not a notification stream.** Briefings fire on a fixed cadence. The product does not interrupt during the day. It does not push. It does not ping.
- **Not enterprise software.** No roles, permissions, audit logs, or SSO at v1. (Defer to demand.)
- **Not AI-marketed.** Even if a future cycle introduces an LLM somewhere in the pipeline, the marketing surface never says "AI", "intelligent", "smart", "agent", "copilot". The voice rules in BRAND.md govern.
- **Not real-time.** Daily Signal is daily. Weekly Signal is weekly. Launch Signal is on demand. If a user wants a live view, they want Tasks, not Signal.

---

## 8 · Success and anti-success

**v1 ships when:**
- A real user (not Ethan) reads three Daily Signals in a row and acts on at least one item per briefing.
- The user can describe what the product does in one sentence without using the word "AI", "dashboard", or "tracker".
- Time-to-first-briefing from sign-up is under 5 minutes.
- A briefing has never surfaced an item that, on review, was clearly not worth surfacing (false positive rate ≈ 0 in the trigger set).

**v1 has failed if:**
- Users routinely ignore the briefing and go to Tasks for the actual answer. (Briefing is purely vestigial.)
- Users ask for a "metric view" or "dashboard view". (Brief failed to be sufficient.)
- Users ask which AI model is behind it. (Mechanism leaked through to the experience.)
- Briefing prose feels templated within 5 days of use. (Curated prose library too thin — triggers section 9's revisit clause.)

---

## 9 · How the briefing is generated — locked decision

This is the question Plan 1.1 was created to answer. Three mechanisms were considered.

### Option A — Rules + templated slot-filling
Triggers fire, slots fill from a single template per trigger.
**Rejected** because single-template prose reads robotic by day two.

### Option B — Rules + LLM polish layer
Triggers fire, an LLM rewrites the slot-filled draft into natural prose.
**Rejected for v1** because:
1. Re-introduces AI dependency the brand has spent its first year purging.
2. Any disclosure ("Powered by Claude / GPT / etc") undermines the position.
3. Hallucination risk on a product whose value depends on *trust the briefing*.
4. Cost and latency on what should be a sub-second render.

### Option C — Rules + curated prose library *(LOCKED)*
Triggers fire, one phrasing is selected from a hand-written library of 4–8 per trigger.
**Locked because:**
1. Fully honest. The "AI-invisible" claim is true because there is no AI in the path.
2. Naturalistic enough — at 4–8 phrasings per trigger and rotation logic, repetition is suppressed for weeks.
3. Moves the work from ML tuning (no Ethan edge) to voice curation (Ethan's edge as a designer).
4. Auditable. "Why did I see this?" has a one-sentence answer.

### Honest dissent — when option C will break
At scale (1k+ users with broad work-shape diversity), 4–8 hand-curated phrasings per trigger will start to repeat noticeably across the population. At that point the choice becomes:
1. Expand the prose library (slow, manual, hits diminishing returns around 12 phrasings per trigger).
2. Introduce option B (LLM polish) with a careful "we use no AI in *what* surfaces, only in *how it reads*" framing — but this still violates the current voice ban.
3. Ship templated prose (option A) and accept the robotic-but-honest tradeoff.

**Defined revisit trigger:** revisit this decision when *any* of the following occur:
- A real user describes the briefing as "templated" or "robotic" without prompting.
- The same phrasing fires for the same user twice within a 14-day window for the same trigger.
- We onboard the 100th active user.

Until one of those fires, the curated prose library is the mechanism. Calendar dates do not trigger a revisit.

---

## 10 · Implementation map

This section is intentionally short — it is not a build plan, it is a pointer to where build plans live.

| Concern | Where it gets built | Plan |
|---|---|---|
| Architecture + data layer | analytics repo, new `src/lib/data/` | Plan 6.1 |
| Auth + onboarding | analytics repo, sign-in flow exists; expand in 6.2 | Plan 6.2 |
| Tasks data integration | Read directly from Tasks DB (Turso) — read-only credentials | Plan 6.3 |
| Attention engine triggers | analytics repo, `src/lib/triggers/` (one file per trigger) | Plan 6.4 |
| Prose library | analytics repo, `src/lib/prose/` (one file per trigger, returns phrasings array) | Plan 6.4 |
| Compression + ranking | analytics repo, `src/lib/compression/` | Plan 6.4 |
| Briefing renderer | analytics repo, `src/components/briefing/` + email render via Resend | Plan 6.5 |
| Cadence scheduler | Vercel Cron — daily 7am local, weekly Friday 4pm local, launch on demand | Plan 6.5 |
| Marketing site reality alignment | analytics repo, `/method` and `/signal` copy revisions | Plan 6.6 |

---

## 11 · Open questions (carry into Plan 6 build cycles)

Numbered so they can be referenced later. Do not answer in this document — answer in the cycle that resolves them.

1. **Time zones.** Daily Signal fires at user's local 7am, but how is "local" determined for a user with no calendar connected? Browser TZ at sign-up? Ask in onboarding?
2. **Multi-workspace users.** A freelancer with one workspace per client — one briefing or one per workspace? Recommendation TBD.
3. **First-day behavior.** New user signs up, has 4 tasks, no history. What does day-one briefing look like? "Welcome" briefing? Or wait until there is real signal?
4. **No-signal day.** Real users will have days where genuinely nothing fires. Ship a "Nothing to flag today" briefing? Skip the briefing entirely? Brand-coherent answer matters here.
5. **Email vs in-app.** Briefing is web by default, but most "morning briefing" patterns succeed in email. Email-first or app-first? (Resend is wired in, so email is technically free.)
6. **Pricing.** Free tier shape? Per-user pricing? Per-workspace? Defer to after Plan 6.3 ships and there is real usage signal.

---

## 12 · This document is a contract

When the live marketing site says one thing and this document says another, one of them is wrong. The fix is not to leave them inconsistent.

When a build cycle in Plan 6 wants to ship something this document forbids — the build cycle does not silently break the contract. It changes this document first, with a recorded reason, and then ships against the new contract.

When this document is wrong, fix it here first. Then the code. Then the marketing site.

---

*Locked 2026-05-09 in Plan 1 · Cycle 1.1 (Strategic Foundation). Companion documents: BRAND.md (voice and visual rules), notes/PRODUCT.md (sibling product definition — drafted next in Cycle 1.2).*
