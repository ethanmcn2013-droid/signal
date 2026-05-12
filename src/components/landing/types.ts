import type { BlockId, DemoBlock, DemoItem, DomainId } from "@/lib/domains";

export type { BlockId, DemoBlock, DemoItem, DomainId };

export type Scene =
  | "boot"
  | "phrasing-swap"
  | "cap-attempt"
  | "cap-drop"
  | "delivered"
  | "reset";

export type DemoState = {
  blocks: DemoBlock[];
  scene: Scene;
  delivered: boolean;
  /** id of item whose phrasing is mid-swap (drives the visual highlight). */
  swappingItemId: string | null;
  /** map from item id to current variant index */
  variantByItemId: Record<string, number>;
  /** overflow items currently visible under "Needs attention" */
  overflowVisible: { id: string; text: string }[];
  domain: DomainId;
};
