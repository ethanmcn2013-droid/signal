# Planning Period Signal

Signal Tasks remains the authority for Planning Period, Workspace, and current
Membership. Signal stores only the reader's discriminated preference:

```text
{ kind: workspace, workspaceId }
{ kind: planningPeriod, planningPeriodId }
```

## Rollout and rollback

- Apply `drizzle/0004_planning_period_scope.sql`.
- Set `SIGNAL_PERIOD_SIGNAL_ENABLED=true` to expose Planning Period scope.
- The existing `linked_workspace_id` stays populated as the flag-off rollback
  path. Flag off preserves the previous linked-workspace briefing.
- The Tasks read credential must remain read-only.

Every briefing request resolves the immutable Clerk subject through Tasks,
rechecks current `workspace_members`, excludes archived records, and only then
reads task data. Period scope issues one bounded multi-workspace task query.
Missing Planning Period columns degrade to authorized legacy workspace scope;
period scope fails closed.

Priority Compression is three items total across the briefing. Ranking and tie
breaks are deterministic. Empty scope copy is: “Nothing needs your attention
right now.” Date rules use the scope's IANA timezone and calendar-day math, not
elapsed 24-hour divisions.

The only first-party planning events are `signal_scope_changed` and
`period_signal_viewed`; their payload is scope enum plus bounded workspace
count. They contain no names, content, ids, or tokens.
