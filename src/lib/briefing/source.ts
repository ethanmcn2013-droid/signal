import type { TaskSignal } from "./types";

/**
 * The data contract Phase B.2 will satisfy by reading the user's
 * connected Tasks workspace from the Tasks Turso DB. Today the only
 * implementation is mock-source.ts. Phase C cron handlers and
 * /app/brief both go through this interface so swapping the
 * implementation is a one-line change.
 */
export interface BriefingSource {
  /** All open + recently-shipped tasks for the user, across the
   *  workspaces they belong to. The engine filters/groups itself. */
  getSignalsForUser(userId: string): Promise<TaskSignal[]>;
}
