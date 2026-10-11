# Tasks: Workshop progression
Updated: 2026-10-10
- [x] T001 — Implement server policy, separate persistence, authenticated catalog and commands; AC-001–004.
- [x] T002 — Implement remote journey and reader; AC-001–006.
- [x] T003 — Add explicit local example with graded sample assessment and persisted sample progression; AC-006.
- [x] T004 — Generate contract and verify policy, HTTP, store and rendering tests, architecture/types/build.
- [x] T005 — Verify local Mongo HTTP and browser flow; update architecture/development/handoff.
- [ ] X001 — Publish contract and deploy service/gateway upstream configuration for live accounts. Local integration does not deploy services.


## Evidence
T001/T003: service tests (35) and real local HTTP/Mongo verifier passed. T002/T004: 22 ChromeHeadless tests, strict unused/type check, architecture check, production remote build and generated contract build passed. T005: hosted beta shell loaded the rebuilt remote; assessment gate, two required completions, independent second section and reload persistence observed. `verified-example.jpg` captures level 2 unlocked. X001 remains pending: no package publication or live service deployment was performed.

- [x] T006 — Use ngx-editor-js2 for workshop pages without document persistence; AC-007. Verified 23 ChromeHeadless tests, architecture/type checks, isolated production build and local browser edit/reopen (original content restored).

- [x] T007 — Replace self-attested completion with distinct persisted page visits and exact assessment completion; AC-008. Added authenticated seen endpoint, automatic catalog reconciliation, page counts and retry; generated/packed contract 0.0.53. Verified 41 service tests, 11 active remote tests, local HTTP/Mongo and browser pages→reload→assessment→automatic completion.
