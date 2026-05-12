export type BlockId = "attention" | "moving" | "risks" | "focus";

export type BriefingItem = {
  id: string;
  /** All phrasing variants for this item — used to demonstrate the rotation engine. */
  variants: string[];
  /** Index into variants[] currently rendered. */
  variantIndex: number;
};

export type Block = {
  id: BlockId;
  label: string;
  dot: string;
  items: BriefingItem[];
  /** Items that tried to enter the block but failed the cap. */
  overflow: { id: string; text: string }[];
};

export type Scene =
  | "boot"
  | "phrasing-swap"
  | "cap-attempt"
  | "cap-drop"
  | "delivered"
  | "reset";

export type DemoState = {
  blocks: Block[];
  scene: Scene;
  delivered: boolean;
};

export const BLOCK_DOT: Record<BlockId, string> = {
  attention: "#f59e0b",
  moving: "#10b981",
  risks: "#71717a",
  focus: "var(--brand)",
};

export const BLOCK_LABEL: Record<BlockId, string> = {
  attention: "Needs attention",
  moving: "Moving well",
  risks: "Quiet risks",
  focus: "Suggested focus",
};
