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

## Direct assignment launch — 2026-10-11
FR-009: Workshop links open the referenced lab/test directly, starting or resuming an eligible assignment without a discovery click. Completed assessments open their existing result; coding labs resume active work or start a fresh attempt according to existing retry rules. Missing/locked resources and request failures remain recoverable. Preserve automatic completion return.
AC-008: launch=direct plus exact resource identity opens the assignment once after catalog/history load; no duplicate starts on rerender, no automatic retry after errors, and no starts for missing/locked resources. Ordinary discovery links without launch retain existing behavior.
This supersedes the earlier no-auto-start decision for explicit workshop assignment links. Backend eligibility, ownership and scoring remain unchanged.

## Canonical coding-lab links — 2026-10-11
FR-010 / AC-009: Workshop coding-lab links use /coding-labs/explore with exact lab identity, launch=direct, workshopName and lesson returnTo. Outline and next activity preserve this contract; the coding-lab remote owns attempt/result path selection. This supersedes the previous hello-world target.

## Canonical assessment links — 2026-10-11
FR-011 / AC-010: Placement and assignment links use /take-assessment-test/subjects/:subjectId, encoding the section identity as a single path segment. Preserve exact test, launch=direct, workshopName and lesson returnTo; reader outline/next activity share the same base. The assessment remote owns attempt/review/result routing.

## Hero embers — 2026-10-12
FR-012: Add a dense, fire-like decorative particle background that travels upward with a rightward swaying drift. Use the currently selected Material primary, secondary and tertiary palette, not fixed fire colors.
FR-013: Gently sway the entire hero artwork without changing its existing tablet scale or mobile visibility. Keep copy readable and interactions unobstructed.
FR-014: Honor reduced-motion preferences and provide a keyboard-accessible pause/resume control for continuous decorative motion.
AC-011: Desktop shows 72 staggered glowing particles with upward/rightward trajectories and swaying artwork; changing theme tokens updates particle colors without rebuilding.
AC-012: At 390px, particles remain behind copy with no horizontal overflow, density reduces to 36, and artwork remains hidden. At tablet width, artwork retains its 0.8 scale while swaying.
AC-013: Pause stops particles/artwork and resume restarts them. Reduced motion removes particles and artwork animation and hides the unnecessary motion control.
Assumptions: fire-like intensity means dense glowing embers, not literal orange flames or flashing. This is presentation-only: loading/error/catalog behavior, API requests, routing and federation contracts remain unchanged.
