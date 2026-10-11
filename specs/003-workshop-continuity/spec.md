# Workshop continuity
Status: Implemented; hosted integration pending · 2026-10-11

Learners need one recognizable layout and an explicit return path when moving between workshop lessons, assessments and coding labs.

- FR-001: Match existing assessment/lab theme tokens, hero, gutters, panels and responsive layout in workshops.
- FR-002: Link exact resource IDs without starting an attempt automatically; keep workshop and lesson context through activity navigation.
- FR-003: Return to the saved lesson, reconcile server progress, preserve failed saves and unsaved coding work.
- FR-004: Keep ordered contents visible, distinguish lessons/assessments/labs and provide the next activity.

AC-001: A workshop with mixed entries links the exact assessment and lab and includes an encoded local return path.
AC-002: Activity discovery shows the referenced resource or an unavailable state; internal navigation preserves the return context.
AC-003: Returning reloads authoritative workshop progress and restores the selected lesson; invalid context does not navigate externally.
AC-004: Loading, retry, completion, keyboard focus and narrow layouts remain usable. Existing standalone discovery continues to work.

No scoring, completion policy, API payload, federation export or deployment change. Labs remain optional practice under current server completion policy. Local example stays explicit.
