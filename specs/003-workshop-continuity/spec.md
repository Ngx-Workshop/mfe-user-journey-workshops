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

## Overview refinement — 2026-10-11
FR-005: Remove learner-facing local preview controls; developer example remains opt-in by URL.
FR-006: Organize available/in-progress workshops by section and level, with searchable active/completed views, useful counts and empty states.
FR-007: Completed workshops have a Retake workshop action that opens their first lesson without deleting earned completion, assessments or unlocked levels.
AC-005: Live overview contains no local preview actions; search and view filters expose matching workshops, ordered by level and progress.
AC-006: Retaking a completed workshop loads its first lesson, keeps its completed status and makes no reset/start/progress write for already-seen pages.
Decision: deliver retake/review, not a destructive reset. There is no live per-workshop reset API, and assessment evidence belongs to another service. Retake explicitly retains earned progress.

## Automatic completion return — 2026-10-11
FR-008: After a workshop-launched assignment is confirmed completed by the server, automatically return to the validated workshop destination, restoring the saved lesson and refreshed progress. Regular standalone assignments retain result views.
AC-007: Successful assessment completion and completed lab submission navigate to the workshop with replaceUrl. Saved code alone, failed save/submit, and opening historical completed work do not trigger automatic return. Invalid/missing return context keeps ordinary result behavior. Lab completion is determined by persisted status, not passing score.
