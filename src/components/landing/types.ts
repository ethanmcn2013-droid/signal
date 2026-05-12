import type { BlockId, DemoBlock, DemoItem, DomainId } from "@/lib/domains";
import type { CadenceView } from "./view-toggle";

export type { BlockId, DemoBlock, DemoItem, DomainId, CadenceView };

export type Scene =
  | "boot"
  | "arrival"
  | "cursor-arrive"
  | "cursor-reads"
  | "why-this-open"
  | "why-this-typing"
  | "why-this-close"
  | "phrasing-swap"
  | "cap-attempt"
  | "cap-drop"
  | "delivered"
  | "cursor-focus"
  | "acknowledge"
  | "acknowledged-toast"
  | "view-morph-yesterday"
  | "yesterday-hold"
  | "view-morph-today"
  | "cursor-leaves"
  | "reset";

export type CursorState = {
  x: number;
  y: number;
  visible: boolean;
  reading: boolean;
  label: string;
};

export type DemoState = {
  scene: Scene;
  view: CadenceView;
  delivered: boolean;
  swappingItemId: string | null;
  /** map from item id to current variant index */
  variantByItemId: Record<string, number>;
  /** overflow items currently visible under "Needs attention" */
  overflowVisible: { id: string; text: string }[];
  /** item id currently expanded with "Why this?" */
  whyThisItemId: string | null;
  /** character count of typed final reason line */
  whyThisReveal: number;
  /** item id currently being acknowledged (struck through then removed) */
  acknowledgingItemId: string | null;
  /** set of focus item ids that have been removed via acknowledge */
  acknowledgedSet: Set<string>;
  /** toast variant currently visible */
  toast: "delivered" | "acknowledged" | null;
  cursor: CursorState;
  domain: DomainId;
};
