import type { TaskSignal } from "./types";

/**
 * Identity passed into a BriefingSource. Both fields are needed
 * because cross-product joins are *email-keyed*, Analytics and
 * Tasks may live in separate Clerk apps with non-shared userIds.
 */
export type BriefingContext = {
  userId: string;
  email: string;
};

/**
 * The data contract for "what signals does this user have today?".
 *
 * Implementations:
 *   - mockBriefingSource    Wedding 2026 demo (dev + onboarding).
 *   - tasksDbSource         Read-only join into the Tasks Turso DB.
 *
 * Picked at runtime by getBriefingSource() based on env vars. The
 * cron handler, /app/brief, and the Send-test action all go
 * through this interface, so swapping is one line of change.
 */
export interface BriefingSource {
  getSignalsForUser(ctx: BriefingContext): Promise<TaskSignal[]>;
}
