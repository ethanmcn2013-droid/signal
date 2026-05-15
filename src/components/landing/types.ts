import type { BlockId, DemoBlock, DemoItem, DomainId } from "@/lib/domains";

export type { BlockId, DemoBlock, DemoItem, DomainId };

// The demo only choreographs what the shipped web brief actually does:
// it arrives each morning, the reader scans it, "Why this" expands a
// real reason chain, the phrasing rotates day to day, and the hard
// three-item cap holds. No acknowledge gesture and no Today/Yesterday
// toggle — the product has neither, so the demo claims neither.
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
  /** toast variant currently visible */
  toast: "delivered" | null;
  cursor: CursorState;
  domain: DomainId;
};
