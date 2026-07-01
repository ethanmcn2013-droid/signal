# Signal Collaboration Loop

Signal owns the attention layer of the Signal Studio collaboration loop.

Core question:

What needs attention before it becomes a problem?

## Role In The Ecosystem

Signal turns activity across the workspace into plain-language signals.

It should help creators and collaborators understand:

- what changed
- what is drifting
- what is blocked
- where attention is needed
- what to do next

## Growth Loop Responsibility

Signal makes collaboration feel useful after the first invite because it gives everyone a shared state of work.

It supports this loop:

Workspace created -> collaborators invited -> work becomes clearer -> shareable output created -> new creator discovered.

Signal is responsible for the "work becomes clearer" and "shareable briefing" moments.

## Shared Objects Signal Should Respect

| Object | Signal meaning |
| --- | --- |
| Workspace | The scope for signals and briefings. |
| Person | Owner, overloaded person, blocker, collaborator, or viewer. |
| Task | Activity input for flow, risk, load, and clarity signals. |
| Timeline item | Direction input for confidence and change signals. |
| Note | Context input for unresolved actions, risks, questions, and decisions. |
| Update | Event input for briefings and change analysis. |
| Signal | Plain-language observation with a clear "so what". |
| Shareable output | Today Signal, workspace briefing, or attention summary. |

## Cycle 1 Product Work

Prioritise:

- Today Signal / workspace briefing shape
- collaboration readiness metrics
- signal-to-task approval path
- plain-language risk wording
- events for signal detected, briefing generated, blocker repeated, owner overloaded, and roadmap confidence changed

Avoid:

- generic dashboard charts
- percentages without an action
- analytics that require configuration
- claims that outrun connected data

## Acceptance Test

For the wedding/events wedge, a venue coordinator should open the briefing and understand:

- what needs attention today
- which couple or supplier is waiting
- which planning item is drifting
- what changed since the last update
- what action should happen next

## Cycle 2: Invite And First View

Signal owns the "What matters now" section of the invited collaborator's first view.

Role defaults for Signal:

- Creator sees the full workspace briefing.
- Collaborator sees relevant signals and next actions.
- Guest sees only selected safe briefing content.
- Client / supplier sees what needs their attention.
- Viewer sees public-safe summary language only.

Cycle 2 implementation targets:

- Today Signal block for shared workspaces
- safe signal visibility rules
- briefing share source tracking
- signal-to-task approval path
- no dashboard exposure for guests

Acceptance test:

A couple opens the shared wedding workspace and sees a short briefing that names what needs attention without exposing private planning context.
