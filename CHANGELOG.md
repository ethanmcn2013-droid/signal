# Signal Analytics · Changelog

## 2026-05-12

### Suite review patch — the primary CTA stopped opening nothing.

The Analytics hero shipped with a primary CTA reading "Open the
briefing," routed to `/app`. The `/app` route does not exist in
this repo. Every visitor who clicked the loudest button on the
page hit a 404. That's the §2.2 failure mode written in the brand
handbook — demo-vs-reality drift — quietly running on production.

Repointed the CTA to `/wedding-planning`, the page that already
exists and reads honestly as an example briefing. Changed the verb
from "Open the briefing" to "See a sample briefing." Promise now
matches what the click delivers. The briefing pipeline still has
to be built before `/app` is the right destination; this is the
honest interim, not the final answer.

### Cycle 11.4 shipped — cinematic briefing rebuilt at the Tasks bar.

The old homepage demo (HeroMotion + a thin BriefingMotion fade-in
stagger) read as a static example, not a product surface. That's
been replaced wholesale.

Hero is now Tasks-pattern: eyebrow + H1 ("A briefing, not a
dashboard.") + body + CTAs + status pip ("Demo is live · choose an
audience to reseed") + an AudienceToggle + the cinematic briefing
full-width below. Four audience packs share the suite axis with
Roadmap and Notes: Wedding (default per the locked GTM wedge),
Building project, Product launch, Startup plan. Each pack ships its
own four-block briefing content (Needs attention / Moving well /
Quiet risks / Suggested focus), overflow items for the cap-drop
scene, designated swap items for phrasing rotation, and a whole
separate Yesterday's snapshot.

The briefing now arrives in a sender chrome: small Signal Analytics
avatar + "for · Wedding 2026" + a Briefing pill. Each item carries
a provenance line beneath it in mono ("from Tasks · Wedding 2026")
— proves the read model without needing a data viz.

The demo runs a 19-scene loop. The briefing arrives with a
"Delivered to inbox" toast. A single anonymous reader cursor drifts
in, lingers on an item, and clicks it open: a "Why this?" rule
chain expands beneath the item with three lines of plain-English
reasoning ("No status update in 18 days. Held-up items normally
resolve in 8 days at this stage. Threshold crossed → surfaced for
attention."). The final line types out character-by-character with
a blinking caret. The chain closes.

A phrasing variant swaps on the same item (the rotation engine in
1.5 seconds). Two extra items try to enter Needs attention; they
appear briefly, then drop silently as the cap of three holds.

The cursor moves to a focus item with a "Mark done" pill affordance.
It presses the pill. The item strikes through, fades to 36%, fires
the "Marked done" toast, then disappears from the focus block. The
whole briefing then morphs to Yesterday's snapshot — different
items in Needs attention, different counts in Moving well, different
priorities. Holds. Morphs back. Cursor leaves. Reset.

Stack: motion/react, DOM-measured cursor targeting against item
refs, useReducedMotion guard collapses to the assembled briefing.
