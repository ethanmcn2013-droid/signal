import type { ComponentType } from "react";
import { SignalHeroSig5 } from "./option-the-brief";
import { SignalHeroSig1 } from "./option-morning-edition";
import { SignalHeroSig2 } from "./option-focus-pull";
import { SignalHeroSig3 } from "./option-filed";
import { SignalHeroSig4 } from "./option-undisturbed";

export type LabOption = {
  slug: string;
  name: string;
  role: "hybrid" | "polished" | "wildcard";
  lens: string;
  headline: string;
  blurb: string;
  Component: ComponentType;
};

export const OPTIONS: LabOption[] = [
  {
    slug: "the-brief",
    name: "The Brief",
    role: "hybrid",
    lens: "Morning Edition × Focus Pull",
    headline: "The signal, not the noise.",
    blurb:
      "The front page comes into focus. A blurred, noisy edition racks sharp: the day's real stories set themselves into a clean editorial layout while the noise recedes into haze. Editorial craft with a cinematic entrance.",
    Component: SignalHeroSig5,
  },
  {
    slug: "morning-edition",
    name: "Morning Edition",
    role: "polished",
    lens: "Editorial / Swiss print",
    headline: "The signal, not the noise.",
    blurb:
      "A newspaper front page. Grey column filler loses its ink and collapses in one calm typesetting move, so the day's few real stories set themselves as the only headlines, marked by a single indigo editor's stroke.",
    Component: SignalHeroSig1,
  },
  {
    slug: "focus-pull",
    name: "Focus Pull",
    role: "polished",
    lens: "Cinematic focus-pull",
    headline: "Today, in focus.",
    blurb:
      "An unfocused day of updates racks into focus. Noise recedes into soft depth and bokeh while exactly three lines land crisp, confirmed by an autofocus bracket. The headline names the mechanic.",
    Component: SignalHeroSig2,
  },
  {
    slug: "filed",
    name: "Filed",
    role: "polished",
    lens: "Tactile / paper",
    headline: "The signal, not the noise.",
    blurb:
      "A messy desk-pile of index cards gets calmly filed away, one by one, until three cards are left standing with weight. Suppression felt as a physical act of sorting.",
    Component: SignalHeroSig3,
  },
  {
    slug: "undisturbed",
    name: "Undisturbed",
    role: "wildcard",
    lens: "Interaction-first",
    headline: "The signal, not the noise.",
    blurb:
      "Run your pointer through the field and the noise scatters like paper caught in air, while the three lines that matter never move. The visitor proves the thesis with their own hand.",
    Component: SignalHeroSig4,
  },
];
