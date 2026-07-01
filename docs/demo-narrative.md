# Signal · 30-Second Demo · Narrative + Storyboard

**Cycle 7.1 · Plan 7 (Demo videos) · Drafted 2026-05-10**

This document locks the narrative and storyboard for the 30-second Signal demo before any motion work begins. It exists so the Remotion build (Cycle 7.2) starts from a script, not from "let's see what looks good in After Effects."

When this document and the live demo disagree, fix this document first if it's wrong; otherwise fix the demo.

---

## 1 · The brand position the demo has to carry

Three claims the demo cannot weaken:

1. **A briefing, not a dashboard.** The thing on screen must read as something a person would write, not as a UI.
2. **Two minutes a day.** The demo itself should feel calm enough that two minutes feels generous.
3. **Plain English.** No abstract icons, no charts, no metric tiles. Type carries the meaning.

Three things the demo cannot do:

- Use a generic SaaS-demo grammar (cursor moving, dropdowns, "Click to learn more"). This is not that product.
- Show a comparison ("Notion looks like X, Signal looks like Y"). The brand fights jargon by ignoring it, not by performing the fight.
- Use stock footage of a person's hands on a keyboard. Tired and category-betraying.

---

## 2 · Three narrative options considered, one chosen

### Option A — "The morning of a wedding planner" (personal)
Open on a phone on a bedside table. 7am. Notification arrives. She picks it up, reads. We see the briefing. She closes the phone, gets up.

**Strength:** humanizes the audience the brand is positioned for.
**Risk:** every SaaS demo opens this way. Becomes "wedding planner stock footage" if we're not surgical.

### Option B — "What arrives at 7am" (abstract typography)
Black frame. Mono eyebrow types in: `SUNDAY, MAY 10 · DAILY BRIEFING`. Then the greeting. Then the briefing assembles itself, line by line. End on the full brief, then the wordmark.

**Strength:** maximally brand-coherent. The typography IS the brand. Apple-Calendar reference register. Linear-launch energy.
**Risk:** abstract — for someone who doesn't know what Signal is yet, "typography assembling itself" is beautiful but doesn't always close.

### Option C — "From dashboard to briefing" (before/after)
Open on a busy dashboard with charts and gauges and sliders. Hold for two seconds. Cut to the briefing. Hold for the rest.

**Strength:** the differentiation is the demo. Aggressive.
**Risk:** the bad-thing-shown can stick more than the good-thing-shown. Negative framing also makes us look like we're punching down at incumbents we don't need to acknowledge.

### Locked: **Option B with a small touch of A at the end** (chosen)
Open in pure typography (Option B's strength: brand-coherent). End with a brief glimpse of context — the briefing as it appears on a phone screen, framed by a window-light reflection — so the abstract-to-real bridge lands. No people, no hands. The phone is the closing shape, not the protagonist.

---

## 3 · 30-second storyboard

**Total runtime: 30 seconds at 30fps = 900 frames.**

| Time | Frame | Content | Motion notes |
|---|---|---|---|
| 0:00–0:02 | 0–60 | Black frame, holding | Pure black. 2 seconds of nothing builds tension and signals "this is not a SaaS demo". |
| 0:02–0:04 | 60–120 | Mono eyebrow types in, character by character: `SUNDAY, MAY 10 · DAILY BRIEFING` | Mono caps tracked. Type-on at 30 chars/sec. Color: `#71717a`. No cursor blink. |
| 0:04–0:06 | 120–180 | Hold 1s on the eyebrow alone | Restraint. The eyebrow lives by itself for a beat. |
| 0:06–0:09 | 180–270 | Display-size greeting fades in: `Good morning.` | 600ms fade-in via `cubic-bezier(.32, .72, 0, 1)`. No type-on for the greeting — it appears whole. The word that appears whole, after the typed eyebrow, is the moment of the demo. |
| 0:09–0:11 | 270–330 | Hold 2s | Both elements live for a moment before any block appears. |
| 0:11–0:14 | 330–420 | First block appears: amber dot draws in, label "Needs attention" types after | Dot scales 0→1 in 200ms. Label types in at 35 chars/sec after dot lands. |
| 0:14–0:18 | 420–540 | First sentence types in: `Vendor quote signoff has been quiet for 8 days, and Confirm flowers is held up by it.` | 35 chars/sec type-on. ~125 chars × 28ms = 3.5s. Hits a ¾-screen width. |
| 0:18–0:21 | 540–630 | Second block appears: emerald dot + "Moving well" + first sentence: `You closed 5 things this week.` | Dot+label same pattern. Sentence type-on at 35 chars/sec. |
| 0:21–0:24 | 630–720 | Third block appears: indigo dot + "Suggested focus" + action sentence: `Chase Vendor quote signoff today — Confirm flowers is waiting on it.` | Dot+label same pattern. Indigo `#4f46e5`. The action sentence is the closer — it's what you'd actually do today. |
| 0:24–0:27 | 720–810 | Camera pulls back: the briefing is now framed inside a phone screen on a desk, with a soft window-light glow on the right edge | The pull-back is a 2D zoom-out — Remotion `interpolate` on scale + opacity layer for the phone bezel + soft light gradient. No 3D, no real photography. |
| 0:27–0:30 | 810–900 | Wordmark fade-in below the phone: `analytics·` (lowercase, with static brand-indigo dot) | Wordmark is the closing shape. 600ms fade. Hold for 1.5s before the cut to black. |

**End frame (frame 900):** black, with the wordmark `analytics·` and small mono caption `signalstudio.ie/analytics` visible for 200ms before fade-out.

---

## 4 · Voiceover — included or not?

**Recommendation: NO voiceover.**

Reasons:
- The brand voice lives in the typography. A narrator competing with type is a register conflict.
- Most SaaS demos add voiceover and they all start sounding the same. Silence is differentiating.
- The 30-second runtime is short enough that the eye can follow the type without audio guidance.

If voiceover is used (override decision), the script would be **two lines, total**:
1. (0:11) "What needs your attention today."
2. (0:24) "A briefing, not a dashboard."

Anything more is product-narrator energy. Voice talent register: warm, low, unhurried — closer to *On Being* than *TED Talks*. NOT a cheery tutorial voice.

---

## 5 · Music — what kind, what NOT

**Recommendation: ambient + minimal — single piano or muted pad. NO drums, NO build, NO drop.**

The wrong music ruins this demo more than the wrong type would. Apple-Calendar / Notion-Calendar reference register: a single sustained note or two-chord ambient pad that holds steady throughout.

**Banned:**
- Driving electronic / build-and-drop
- Acoustic guitar with hand-claps (the "startup explainer" cliché)
- Cinematic-trailer brass swells
- Anything with vocals, even ambient

**License paths:**
- Pixabay Music (CC0, free) — has ambient piano tracks
- Free Music Archive
- Epidemic Sound subscription (paid; clean license)
- Or: commission a 30s track from a composer (~$200–500)

If we go free-license, *the music has to be deliberate, not "good enough"*. A bad free track is worse than silence. **Honest dissent on free-music**: most CC0 ambient tracks I've encountered are thin or loop-y. If this demo is meant to land on the homepage, a commissioned track or Epidemic subscription is probably the right level.

---

## 6 · Where the demo lands

**Primary embed location: homepage hero, replacing or supplementing the existing `BriefingMotion` server-component animation.**

Currently `analytics-phi-ten.vercel.app` shows a typography motion of the briefing assembling itself, built with Framer Motion. This works but is HTML/CSS-based and won't render on the homepage of a marketing pitch deck or in a Twitter post.

The 30s demo:
- Embeds on homepage hero (autoplay muted, loop)
- Lives at `/demo` as a dedicated route with a "Watch the demo" CTA from the homepage
- Exports as MP4 + WebM for sharing (Twitter, LinkedIn, sales decks, Loom-style intros)

**Honest dissent on hero-replacement**: the existing typography motion works in-page (HTML, low-res-friendly, accessible). Replacing it with an MP4 means a heavier hero and an autoplay-video pattern that a) the brand has been disciplined about avoiding and b) some users find aggressive. **Recommendation**: keep the existing HTML-based typography motion as the homepage hero. The MP4 demo lives on `/demo` and gets shared externally. The homepage stays calm.

---

## 7 · Production decisions Ethan owns

These are the calls I shouldn't unilaterally lock — they're brand register decisions or paid-action decisions.

| # | Decision | My push | Open question |
|---|---|---|---|
| 1 | Final narrative — Option B, Option B+A, Option A, or a 4th not considered? | **Option B + small A bridge** (locked in §2) | Override if a different framing fits the upcoming outbound campaign |
| 2 | Voiceover yes/no? | **No** | If yes, voice talent direction needed |
| 3 | Music license path — CC0, Epidemic, commissioned? | **Commissioned or Epidemic** | If CC0, willing to spend an hour curating the track? |
| 4 | Demo length — 30s, 45s, 60s? | **30s** (locked above) | A 60s "extended cut" could live alongside as `/demo/extended` |
| 5 | Demo aspect ratio — 16:9 only, or 9:16 vertical for social? | **Both: render 16:9 first, vertical-cut for social second** | Social-first or web-first? |
| 6 | Embed location — homepage hero replacement, /demo route only, both? | **Keep homepage as-is, add /demo route** (locked above with dissent) | Override if you want the autoplay video on hero |
| 7 | Brand colors in the demo — pure white-on-black, or warm-stone-on-black, or warm-stone-on-warm-stone? | Warm-stone bg (`#fafaf7`) **matching the actual app**, not pure white | The black-frame opening (§3) is for tension only — main body matches the briefing's actual chrome |
| 8 | Voiceover script if used — the two lines in §4 or different? | The two lines in §4 | Skip if "no voiceover" stays locked |

---

## 8 · What Cycle 7.2 ships (after this doc is signed off)

Locked: Remotion scaffold + first typography-only cut (no voiceover, no music yet).

- Standalone Remotion project at `~/Projects/personal/analytics-demo/` (separate repo — Remotion has its own bundler that fights with Next's Turbopack)
- Compositions for the 30s timeline above, frame-accurate
- Ship the typography cut as MP4 to `analytics/public/demo-typography.mp4` for preview embed at `analytics-phi-ten.vercel.app/demo`
- Eyeball gate: does the type rhythm feel right against the storyboard's per-frame timing?

Then 7.3: voiceover (if locked) + music (if locked) + final color-grade + render at 1080p and 4K.

---

## 9 · Visual reference register

When in doubt, look at:

- **Apple — iOS launch keynotes.** The way text appears, holds, and resolves. The pacing. The willingness to let a single word live alone for 800ms.
- **Linear — homepage motion.** The "open Linear" hover-state animation. Restrained, deliberate, type-led.
- **Notion Calendar — daily agenda renders.** The way time-of-day is presented as type, not as a clock face.
- **Arc — first-launch onboarding.** The way the browser narrates itself without a tutorial.

When in doubt about what NOT to look like:

- Notion Page — the "type your first doc" onboarding sequence. Too cheerful, too cursored.
- Productboard / ClickUp / Asana demo videos — the "watch the system fill the dashboard" trope. Anti-Signal.
- Slack day-in-the-life ads — the "smiley person on couch" cliché. Anti-Signal.

---

*Plan 7 · Cycle 7.1 · Drafted 2026-05-10. Companion to BRAND.md (voice) and PRODUCT.md (briefing artifact). Locks before Cycle 7.2 begins.*
