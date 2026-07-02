"use client";

import type { CSSProperties } from "react";

/**
 * Signal hero, Three Things Only.
 *
 * The first state is a noisy set of raw candidates. The motion suppresses the
 * non-essential items and resolves into the Daily Signal briefing. Reduced
 * motion renders the final briefing state immediately.
 */

const rawCandidates = [
  { text: "Claire's wedding supplier answer is still missing.", keep: true },
  { text: "Venue invoice has no clear owner.", keep: true },
  { text: "Maeve case study draft is ready for review.", keep: true },
  { text: "Two label tweaks landed yesterday.", keep: false },
  { text: "Tom moved the lighting list to Friday.", keep: false },
  { text: "Printer quote changed by a small amount.", keep: false },
  { text: "Three closed tasks came from admin cleanup.", keep: false },
  { text: "Backdrop samples arrived on time.", keep: false },
  { text: "The old homepage thread is archived.", keep: false },
  { text: "Copy pass moved from notes into Tasks.", keep: false },
  { text: "Calendar import finished without action.", keep: false },
  { text: "Checklist wording changed in one project.", keep: false },
];

const briefingLines = [
  "Claire's wedding needs the supplier answer today or Friday's print window slips.",
  "Maeve's case study is moving well and is ready for one review pass.",
  "Name the venue invoice owner before noon so the handoff does not stall.",
];

export function AnalyticsHeroSignal() {
  return (
    <section className="anl-hero-section" aria-label="Signal Daily Signal">
      <p className="anl-sr-only">
        Signal suppresses raw candidate items and leaves a Daily Signal with
        three briefing lines.
      </p>

      <div className="anl-chrome anl-chrome-tl" aria-hidden="true">
        <span className="anl-suite-word">signal studio</span>
        <span className="anl-slash">/</span>
        <span>signal</span>
      </div>

      <div className="anl-chrome anl-chrome-tr" aria-hidden="true">
        <span className="anl-pip" />
        <span>three things only</span>
      </div>

      <div className="anl-stage" aria-hidden="true">
        <div className="anl-raw-panel">
          <div className="anl-panel-label">Raw candidates</div>
          <span className="anl-scan-line" aria-hidden="true" />
          <ul className="anl-candidate-list">
            {rawCandidates.map((candidate, index) => (
              <li
                key={candidate.text}
                className={
                  candidate.keep
                    ? "anl-candidate anl-candidate-keep"
                    : "anl-candidate anl-candidate-suppress"
                }
                style={
                  {
                    "--anl-in-delay": `${index * 35}ms`,
                    "--anl-settle-delay": `${620 + index * 18}ms`,
                  } as CSSProperties
                }
              >
                <span className="anl-candidate-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="anl-candidate-text">{candidate.text}</span>
                <span className="anl-candidate-state">
                  {candidate.keep ? "kept" : "suppressed"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <article className="anl-brief">
          <div className="anl-brief-top">
            <span className="anl-wordmark">
              <span>signal</span>
              <span className="anl-wordmark-dot" />
            </span>
            <span className="anl-brief-kicker">Daily Signal</span>
          </div>

          <p className="anl-receipt">
            Read 14 task updates. Suppressed 11. Kept the 3 that change today.
          </p>

          <ol className="anl-brief-lines">
            {briefingLines.map((line, index) => (
              <li
                key={line}
                style={
                  {
                    "--anl-line-delay": `${1280 + index * 120}ms`,
                  } as CSSProperties
                }
              >
                <span className="anl-line-number">{index + 1}</span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
        </article>
      </div>

      <p className="anl-caption">Everything important. Nothing distracting.</p>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.anl-hero-section {
  --anl-bg: var(--bg, #ffffff);
  --anl-ink: var(--ink, #111111);
  --anl-ink-soft: var(--ink-soft, #525252);
  --anl-ink-quiet: var(--ink-quiet, #8c887e);
  --anl-border: var(--border, rgba(17, 17, 17, 0.1));
  --anl-border-strong: rgba(17, 17, 17, 0.16);
  --anl-surface: #fafafa;
  --anl-indigo: #4f46e5;
  --anl-font: var(--font-geist-sans, var(--font-geist, system-ui, sans-serif));
  --anl-mono: var(--font-geist-mono, var(--font-mono-stack, ui-monospace, SFMono-Regular, Menlo, monospace));
  position: relative;
  overflow: hidden;
  min-height: min(88svh, 900px);
  padding: clamp(88px, 12vh, 136px) 24px clamp(64px, 8vh, 100px);
  background: var(--anl-bg);
  color: var(--anl-ink);
  font-family: var(--anl-font);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
}

.anl-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.anl-chrome {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--anl-ink-quiet);
  font-family: var(--anl-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.anl-chrome-tl { top: 32px; left: 32px; }
.anl-chrome-tr { top: 32px; right: 32px; }

.anl-suite-word {
  color: var(--anl-ink);
}

.anl-slash {
  color: var(--anl-ink-quiet);
}

.anl-pip {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--anl-indigo);
  opacity: 1;
  animation: anl-pip-settle 1.1s ease 0ms 1 forwards;
}

.anl-stage {
  width: min(100%, 1120px);
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(360px, 1.08fr);
  gap: clamp(18px, 3vw, 34px);
  align-items: stretch;
}

.anl-raw-panel,
.anl-brief {
  border: 1px solid var(--anl-border);
  background: var(--anl-bg);
}

.anl-raw-panel {
  padding: 18px;
  position: relative;
  overflow: hidden;
  transform-origin: center right;
  animation: anl-raw-settle 720ms cubic-bezier(0.16, 1, 0.3, 1) 720ms 1 forwards;
}

.anl-scan-line {
  position: absolute;
  top: 54px;
  bottom: 18px;
  left: 18px;
  width: calc(100% - 36px);
  pointer-events: none;
  overflow: hidden;
  z-index: 2;
}

.anl-scan-line::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 1px;
  background: linear-gradient(
    180deg,
    rgba(79, 70, 229, 0),
    rgba(79, 70, 229, 0.72) 20%,
    rgba(79, 70, 229, 0.72) 78%,
    rgba(79, 70, 229, 0)
  );
  opacity: 0;
  animation: anl-scan-sample 1280ms cubic-bezier(0.22, 0.7, 0.2, 1) 460ms 1 both;
}

.anl-panel-label,
.anl-brief-kicker,
.anl-candidate-index,
.anl-candidate-state,
.anl-caption {
  font-family: var(--anl-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.anl-panel-label {
  margin-bottom: 14px;
  color: var(--anl-ink-quiet);
}

.anl-candidate-list {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.anl-candidate {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  border-top: 1px solid var(--anl-border);
  color: var(--anl-ink-soft);
  opacity: 0;
  transform: translateY(6px);
  animation:
    anl-candidate-in 300ms cubic-bezier(0.16, 1, 0.3, 1) var(--anl-in-delay) 1 forwards,
    anl-candidate-suppress 520ms cubic-bezier(0.16, 1, 0.3, 1) var(--anl-settle-delay) 1 forwards;
}

.anl-candidate-keep {
  color: var(--anl-ink);
  animation:
    anl-candidate-in 300ms cubic-bezier(0.16, 1, 0.3, 1) var(--anl-in-delay) 1 forwards,
    anl-candidate-keep 520ms cubic-bezier(0.16, 1, 0.3, 1) var(--anl-settle-delay) 1 forwards;
}

.anl-candidate-index,
.anl-candidate-state {
  color: var(--anl-ink-quiet);
}

.anl-candidate-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  line-height: 1.4;
}

.anl-candidate-keep .anl-candidate-state {
  color: var(--anl-indigo);
}

.anl-brief {
  position: relative;
  min-height: 520px;
  padding: clamp(24px, 4vw, 42px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  opacity: 0;
  transform: translateY(18px);
  box-shadow: 0 28px 80px rgba(17, 17, 17, 0.06);
  animation: anl-brief-arrive 620ms cubic-bezier(0.16, 1, 0.3, 1) 980ms 1 forwards;
}

.anl-brief::before {
  content: "";
  position: absolute;
  inset: 18px;
  border: 1px solid rgba(79, 70, 229, 0.18);
  pointer-events: none;
  opacity: 0;
  animation: anl-brief-focus 520ms cubic-bezier(0.16, 1, 0.3, 1) 1.22s 1 forwards;
}

.anl-brief-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 18px;
}

.anl-wordmark {
  display: inline-flex;
  align-items: baseline;
  color: var(--anl-ink);
  font-size: clamp(42px, 7vw, 92px);
  font-weight: 570;
  letter-spacing: -0.055em;
  line-height: 0.95;
}

.anl-wordmark-dot {
  position: relative;
  width: 0.16em;
  height: 0.16em;
  margin-left: 0.06em;
  margin-bottom: 0.08em;
  border-radius: 999px;
  background: var(--anl-indigo);
  transform-origin: center;
  animation: anl-dot-samples 2200ms cubic-bezier(0.45, 0.05, 0.55, 0.95) 1.06s 1 both;
}

.anl-wordmark-dot::after {
  content: "";
  position: absolute;
  inset: -0.22em;
  border: 1px solid rgba(79, 70, 229, 0.26);
  border-radius: 999px;
  opacity: 0;
  transform: scale(0.62);
  animation: anl-dot-receipt 2200ms cubic-bezier(0.22, 0.7, 0.2, 1) 1.06s 1 both;
}

.anl-brief-kicker {
  color: var(--anl-ink-quiet);
  white-space: nowrap;
}

.anl-receipt {
  max-width: 34rem;
  margin: clamp(26px, 4vw, 44px) 0 0;
  color: var(--anl-ink-soft);
  font-size: clamp(18px, 2.2vw, 25px);
  font-weight: 480;
  letter-spacing: -0.026em;
  line-height: 1.25;
}

.anl-brief-lines {
  display: grid;
  gap: 0;
  margin: clamp(24px, 4vw, 40px) 0 0;
  padding: 0;
  list-style: none;
}

.anl-brief-lines li {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 16px;
  padding: 18px 0;
  border-top: 1px solid var(--anl-border);
  color: var(--anl-ink);
  font-size: clamp(16px, 1.7vw, 20px);
  line-height: 1.45;
  opacity: 0;
  transform: translateY(8px);
  animation: anl-line-arrive 420ms cubic-bezier(0.16, 1, 0.3, 1) var(--anl-line-delay) 1 forwards;
}

.anl-line-number {
  color: var(--anl-indigo);
  font-family: var(--anl-mono);
  font-size: 12px;
  line-height: 1.8;
}

.anl-caption {
  max-width: 64ch;
  margin: 0;
  color: var(--anl-ink-quiet);
  line-height: 1.5;
  text-align: center;
}

@keyframes anl-pip-settle {
  0%, 45% { opacity: 1; transform: scale(1); }
  100% { opacity: 0.66; transform: scale(0.92); }
}

@keyframes anl-candidate-in {
  0% { opacity: 0; transform: translateY(6px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes anl-scan-sample {
  0% {
    left: 0;
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  84% {
    left: 100%;
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

@keyframes anl-dot-samples {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  12% {
    transform: scale(1.48);
  }
  20% {
    transform: scale(0.94);
  }
  36% {
    transform: scale(1.32);
  }
  44% {
    transform: scale(0.98);
  }
  60% {
    transform: scale(1.2);
  }
  70% {
    transform: scale(1);
  }
}

@keyframes anl-dot-receipt {
  0%,
  8%,
  24%,
  32%,
  48%,
  56%,
  100% {
    opacity: 0;
    transform: scale(0.62);
  }
  14%,
  38%,
  62% {
    opacity: 1;
    transform: scale(1.25);
  }
}

@keyframes anl-candidate-suppress {
  0% { opacity: 1; transform: translateX(0); }
  100% { opacity: 0.2; transform: translateX(-4px); }
}

@keyframes anl-candidate-keep {
  0% { opacity: 1; transform: translateX(0); }
  100% { opacity: 1; transform: translateX(8px); }
}

@keyframes anl-raw-settle {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0.72; transform: scale(0.985); }
}

@keyframes anl-brief-arrive {
  0% { opacity: 0; transform: translateY(18px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes anl-brief-focus {
  0% { opacity: 0; transform: scale(1.01); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes anl-line-arrive {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .anl-hero-section *,
  .anl-hero-section *::before,
  .anl-hero-section *::after {
    animation-duration: 1ms !important;
    animation-delay: 0ms !important;
    transition-duration: 1ms !important;
  }

  .anl-pip {
    opacity: 0.66;
    transform: scale(0.92);
  }

  .anl-scan-line {
    display: none;
  }

  .anl-raw-panel {
    opacity: 0.72;
    transform: scale(0.985);
  }

  .anl-candidate {
    opacity: 0.2;
    transform: translateX(-4px);
  }

  .anl-candidate-keep {
    opacity: 1;
    transform: translateX(8px);
  }

  .anl-brief,
  .anl-brief::before,
  .anl-brief-lines li {
    opacity: 1;
    transform: none;
  }

  .anl-wordmark-dot {
    opacity: 1;
    transform: none;
  }

  .anl-wordmark-dot::after {
    display: none;
  }
}

@media (max-width: 900px) {
  .anl-hero-section {
    min-height: auto;
    padding: 88px 18px 54px;
  }

  .anl-stage {
    grid-template-columns: 1fr;
  }

  .anl-raw-panel {
    max-height: 282px;
    overflow: hidden;
  }

  .anl-brief {
    min-height: auto;
  }
}

@media (max-width: 600px) {
  .anl-chrome-tl {
    top: 22px;
    left: 20px;
  }

  .anl-chrome-tr {
    display: none;
  }

  .anl-candidate {
    grid-template-columns: 28px minmax(0, 1fr);
  }

  .anl-candidate-state {
    display: none;
  }

  .anl-brief-top {
    display: grid;
    gap: 10px;
  }

  .anl-brief::before {
    inset: 14px;
  }
}
`;
