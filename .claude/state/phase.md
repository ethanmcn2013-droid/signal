Analytics · truth pass A·6–A·9 · COMPLETE 2026-05-15

Vocabulary: cycles are `A·NN`. Verbs follow BRAND.md §6.5 (ships / tightens / cuts / holds / reads).

A·13 — UX remediation (R3/R4/R10/R13) ✓ prod-verified 2026-05-17; ff-merged to main 2026-05-18. R4 single-nav incl. the out-of-group /wedding-planning residual CLOSED 2026-05-18 (81a32fa) — no residual owed.

A·9 — briefing prose hardened          ✓ shipped 2026-05-15 (7e877df) — pixel-verified the real signed-in /app/brief via the actual buildBriefing + BriefingView pipeline behind the Clerk gate at 390px and 1440px. focusText stopped stacking an imperative verb onto verb-led titles ("Catch up on send invitations" → names the task; block header + due chip carry the directive; also resolves a §3 over-step). just-shipped "is done" → "— done" (no double-state). mock-source titles → realistic user phrasings. 154/154 tests. Populated AND empty briefings now hold the bar.

A·8 — public surface voice            ✓ shipped 2026-05-15 — full pixel audit at 390/1440 across /, /demo, /method, /signal, /pricing, /wedding-planning, /about. One §3 defect: "no LLM in the path" ×3 (jargon as positive self-description) → plain English. "Not an AI workspace" refusal block left intact (anti-feature pattern).

A·7 — demo-vs-reality cut             ✓ shipped 2026-05-15 — cinematic demo stripped of the "Mark done" gesture + Today/Yesterday toggle the shipped brief never had (building them for real would breach the Tasks/Analytics boundary). Dead model removed (yesterdayBlocks + acknowledgeItemId + 4 *_YESTERDAY arrays; view-toggle.tsx deleted; Scene/DemoState trimmed).

A·6 — demo audience truth             ✓ shipped 2026-05-15 — homepage demo toggle relocked from off-mission "Product launch"/"Startup plan" (PR/API/SOC-2/seed-round vocab — a §2.3 moat breach) to the §2.1 archetypes: wedding · construction · freelance · student.

Next frontier (deferred — additive depth, backend, not a voice/design gap):
broader trigger range, more prose variety, per-timezone send. Per the goal's own framing, backend infra waits; the voice/content/design pass is complete and verified on phone + desktop, public + the real paid briefing code path.

A·13 · UX remediation (R3/R4/R10/R13) prod-verified 2026-05-17; R4 /wedding-planning closed 2026-05-18

Seamless ecosystem — analytics L2/3/4 (auth-aware entry + §14 shell, /wedding-planning stays C) prod-verified 2026-05-18

Known accepted conventions (deliberately not chased):
- "Honeymoon flights hasn't moved" — task-as-singular-subject; consistent, calm, not chased into brittle pluralization NLP.
- /about and /demo omit the footer-suite — deliberately spare pages with ← Back; operator judgment, not a defect.
