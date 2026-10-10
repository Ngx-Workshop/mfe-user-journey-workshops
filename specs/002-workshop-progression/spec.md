# Feature: Workshop progression
Status: Implemented; live integration pending
Feature ID: 002-workshop-progression
Created: 2026-10-10
Updated: 2026-10-10
Request: Implement the fundamental learner workshop journey.

## Problem and scope
The remote currently renders seed CRUD. Learners need per-section assessment placement, eligible workshops, traversal and persisted completion. Include an explicit isolated sample experience. Preserve App/Routes/federation exports and hello-world route. Polished design and automatic coding-lab grading are outside this iteration.

## Requirements and acceptance
- FR-001 / AC-001: Without a completed initial assessment, a section offers its assessment and exposes no workshops. Missing assessments produce a useful unavailable state.
- FR-002 / AC-002: Completion of an assessment permits level 1; highest passed assessment level may place a learner higher. Match sections by exact ID, not display title.
- FR-003 / AC-003: Only incomplete eligible workshops appear as start/resume actions. Completing all workshops at a level advances to the next configured level; completion in another section cannot unlock it.
- FR-004 / AC-004: Start/completion persist for the authenticated identity. Server rechecks eligibility on commands; duplicate completion is idempotent. Completion is explicitly self-attested for this fundamental example.
- FR-005 / AC-005: A learner can inspect a workshop outline and read page content, then confirm completion. Assessment references link to their existing journey; coding-lab references are displayed and included in the learner completion confirmation.
- FR-006 / AC-006: Loading, empty, errors and retry are visible; failed writes retain the open workshop. An explicit local example uses synthetic data and an isolated local database.

## Quality and boundaries
OnPush, signals, MVVM, inline BEM views, keyboard access. User metadata service owns a separate learning-progress collection. Profile PATCH cannot write progress. Assessment service owns assessment results; document service owns workshop levels/content. Client visibility is supplemented by server command checks. Document pages remain subject to the existing document service access policy.

## Assumptions
Initial assessment completion (including a failed result) permits level 1 so learners can study. Placement is max(1, highest passed assessment level). All workshops within each configured level are required. Gaps advance to the next configured level. Existing assessment journey handles live test-taking; explicit local example provides a graded sample initial test. Completion is a learner confirmation, not proof of mastery. Higher assessment placement is honored on refresh.

## Workshop page rendering follow-up
FR-007 / AC-007: Display lesson pages with ngx-editor-js2 using the same serialized block format as the document editor. Retain saved block properties and support existing HTML pages. Temporary editing is accepted until the library supports readonly; no document saving is implemented. Reopening a page restores server content. Empty or malformed content produces a placeholder or retryable error.
