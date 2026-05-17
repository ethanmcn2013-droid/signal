/**
 * data/source.ts — Bridge from external data systems → WorkRead.
 *
 * Cycle 6.1 shipped the read() contract.
 * Cycle 6.2 added listForUser() against mockSource.
 * Cycle 6.3 implements `tasksDbSource` against the real Signal Tasks
 *   Turso DB (read-only token). The active `dataSource` const switches
 *   on TASKS_DATABASE_URL presence — prod uses the real source; dev
 *   without env vars falls back to mock so the marketing build still
 *   runs offline.
 */

import { eq } from "drizzle-orm";
import type { WorkRead, TaskRead, ProjectRead, Status } from "./types";
import { tasksDb, tasksDbConfigured } from "@/server/tasks-db/client";
import {
  tasks as tasksTable,
  workspaces as workspacesTable,
  users as usersTable,
  workspaceMembers as workspaceMembersTable,
} from "@/server/tasks-db/schema";

export interface WorkspaceCandidate {
  workspaceId: string;
  name: string;
  role: "owner" | "member";
}

export interface DataSource {
  read(workspaceId: string): Promise<WorkRead>;
  /** Workspaces this Clerk user can brief (owner or member). */
  listForUser(externalUserId: string): Promise<WorkspaceCandidate[]>;
}

// ── Mock source (dev fallback + tests) ─────────────────────────────

export function mockSourceWith(opts: {
  workspaces: WorkspaceCandidate[];
}): DataSource {
  return {
    async read(workspaceId: string): Promise<WorkRead> {
      return {
        workspaceId,
        snapshotAt: new Date().toISOString(),
        projects: [],
        tasks: [],
        events: [],
      };
    },
    async listForUser(_externalUserId: string): Promise<WorkspaceCandidate[]> {
      return opts.workspaces;
    },
  };
}

export const mockSource: DataSource = mockSourceWith({
  workspaces: [
    { workspaceId: "ws_demo", name: "Demo workspace", role: "owner" },
  ],
});

// ── Real Tasks DB source (Cycle 6.3 + 6.4 lane canonicalization) ───

/**
 * Tasks lane → Analytics Status mapping table. Locked in Cycle 6.4.
 *
 * Tasks's canonical lane vocabulary is `"todo" | "doing" | "review" | "done"`
 * (tasks/src/lib/data.ts). Analytics's Status enum is the trigger-facing
 * read contract Analytics owns. The translation is one-way and lives here
 * — triggers never see Tasks's vocabulary.
 *
 * Derivation rules:
 *  - `blocked` is NOT lane-derived. A task is `blocked` when
 *    `blockedBy.length > 0 && lane !== "done"`. Tasks models blocking
 *    via the `blockedBy` array, not via a lane. Applied in deriveStatus.
 *  - `refused` does not materialize from Tasks's data — Tasks has no
 *    rejected/cancelled state. Triggers must not assume it appears in
 *    real WorkRead snapshots from tasksDbSource.
 *  - Unknown lanes are logged once and mapped to `"next"` (safest
 *    fallback — no false-positive triggers).
 *
 * Documented in PRODUCT.md §6.
 */
const LANE_TO_STATUS: Record<string, Status> = {
  todo: "next",
  doing: "in-flight",
  review: "in-flight",
  done: "shipped",
};

const warnedLanes = new Set<string>();

function deriveStatus(lane: string, blockedBy: string[]): Status {
  const mapped = LANE_TO_STATUS[lane];
  const base: Status =
    mapped ??
    (() => {
      if (!warnedLanes.has(lane)) {
        warnedLanes.add(lane);
        console.warn(
          `[tasksDbSource] Unknown Tasks lane "${lane}" — mapping to "next".`,
        );
      }
      return "next";
    })();
  if (blockedBy.length > 0 && base !== "shipped") return "blocked";
  return base;
}

/**
 * Title-case a tag for human display.
 *   "claire-wedding" → "Claire Wedding"
 *   "oak_rd_renovation" → "Oak Rd Renovation"
 *   "signalstudio" → "Signalstudio"
 *
 * Briefing prose templates can override this with a friendlier name
 * via the prose library (Cycle 6.4); this is the default fallback.
 */
function titleCaseTag(tag: string): string {
  return tag
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const tasksDbSource: DataSource = {
  async read(workspaceId: string): Promise<WorkRead> {
    if (!tasksDb) {
      throw new Error(
        "tasksDbSource called without TASKS_DATABASE_URL configured",
      );
    }

    const rows = await tasksDb
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.workspaceId, workspaceId));

    const taskReads: TaskRead[] = rows.map((t) => {
      const tags = Array.isArray(t.tags) ? t.tags : [];
      const assignees = Array.isArray(t.assignees) ? t.assignees : [];
      const blockedBy = Array.isArray(t.blockedBy) ? t.blockedBy : [];
      const dueDate = t.dueAt
        ? t.dueAt.toISOString().slice(0, 10)
        : t.due ?? null;

      return {
        id: t.id,
        projectSlugs: tags,
        title: t.title,
        assignee: assignees[0] ? { id: assignees[0] } : null,
        status: deriveStatus(t.lane, blockedBy),
        dueDate,
        blockedBy,
        // No separate status-change timestamp in Tasks's schema;
        // updatedAt is the closest proxy. Cycle 6.4 may revisit if
        // any trigger needs strict status-change semantics.
        lastStatusChangeAt: t.updatedAt.toISOString(),
        lastActivityAt: t.updatedAt.toISOString(),
        createdAt: t.createdAt.toISOString(),
      };
    });

    // Synthesize ProjectRead per unique tag (PRODUCT.md §6 mapping).
    const tagBuckets = new Map<string, TaskRead[]>();
    for (const tr of taskReads) {
      for (const slug of tr.projectSlugs) {
        const bucket = tagBuckets.get(slug);
        if (bucket) {
          bucket.push(tr);
        } else {
          tagBuckets.set(slug, [tr]);
        }
      }
    }

    const projects: ProjectRead[] = [];
    for (const [slug, bucket] of tagBuckets) {
      const memberIds = new Set<string>();
      let lastActivityAt = bucket[0].lastActivityAt;
      let createdAt = bucket[0].createdAt;
      for (const tr of bucket) {
        if (tr.assignee) memberIds.add(tr.assignee.id);
        if (tr.lastActivityAt > lastActivityAt) lastActivityAt = tr.lastActivityAt;
        if (tr.createdAt < createdAt) createdAt = tr.createdAt;
      }
      projects.push({
        slug,
        name: titleCaseTag(slug),
        members: Array.from(memberIds).map((id) => ({ id })),
        deadline: null,
        lastActivityAt,
        createdAt,
      });
    }

    return {
      workspaceId,
      snapshotAt: new Date().toISOString(),
      projects,
      tasks: taskReads,
      // Activities deferred — v1 trigger set keys off task fields.
      // Cycle 6.4 will populate this if any trigger needs the event log.
      events: [],
    };
  },

  async listForUser(externalUserId: string): Promise<WorkspaceCandidate[]> {
    if (!tasksDb) {
      throw new Error(
        "tasksDbSource called without TASKS_DATABASE_URL configured",
      );
    }

    // 1. Resolve Clerk userId → Tasks users.id
    const userRows = await tasksDb
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.clerkId, externalUserId))
      .limit(1);
    if (userRows.length === 0) return [];
    const userId = userRows[0].id;

    // 2. Owned workspaces
    const owned = await tasksDb
      .select({ id: workspacesTable.id, name: workspacesTable.name })
      .from(workspacesTable)
      .where(eq(workspacesTable.ownerUserId, userId));

    // 3. Member workspaces (excluding owner — would be in #2 already
    //    via the workspace_members row Tasks creates for the owner).
    const member = await tasksDb
      .select({
        id: workspacesTable.id,
        name: workspacesTable.name,
      })
      .from(workspacesTable)
      .innerJoin(
        workspaceMembersTable,
        eq(workspacesTable.id, workspaceMembersTable.workspaceId),
      )
      .where(eq(workspaceMembersTable.userId, userId));

    // 4. Dedupe with owner taking precedence on role.
    const seen = new Set<string>();
    const out: WorkspaceCandidate[] = [];
    for (const w of owned) {
      if (seen.has(w.id)) continue;
      seen.add(w.id);
      out.push({ workspaceId: w.id, name: w.name, role: "owner" });
    }
    for (const w of member) {
      if (seen.has(w.id)) continue;
      seen.add(w.id);
      out.push({ workspaceId: w.id, name: w.name, role: "member" });
    }
    return out;
  },
};

// ── Active source ──────────────────────────────────────────────────

/**
 * The data source bound at runtime. Switches on TASKS_DATABASE_URL
 * presence: prod uses the real Tasks DB; dev without env vars uses
 * mock so the marketing build still runs and the onboarding picker
 * is exercisable in dev.
 */
export const dataSource: DataSource = tasksDbConfigured
  ? tasksDbSource
  : mockSource;
