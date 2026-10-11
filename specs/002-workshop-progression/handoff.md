# Handoff: Workshop progression
Status: Implemented; live integration pending
Updated: 2026-10-10
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)

## Delivered behavior
App now renders a real workshop journey in place of the seed CRUD catalog. Each section is gated by an initial assessment; eligible workshops can be started/resumed, read and explicitly confirmed complete. All workshops at a level are required before the next configured level appears. Completed names are retained in an expandable history. Errors/retry/loading/empty states are visible; failed completion and assessment submissions preserve user input.

Progress is stored in a separate `workshop_progress` collection owned by service-user-metadata, with a unique authenticated UUID and atomic started/completed ID sets. Editable profile fields/schema remain unchanged. Server start/completion/reader routes enforce assessment and level eligibility. Live assessment state is consumed from the authoritative learner catalog by exact section ID. Completing an initial assessment, including a failed attempt, permits level 1; highest passed levels can place a learner higher.

Completion is learner self-attestation. Coding-lab references are displayed, and assessment references link to the existing assessment journey; automatic exercise grading is outside this version. The reader now uses ngx-editor-js2 21.0.9, preserving saved document editor blocks and adapting legacy HTML into a paragraph block. Existing public document service routes retain their own access policy.

## Acceptance and verification evidence
| Check/scenario | Result | Evidence |
| --- | --- | --- |
| AC-001/002 assessment gate/placement | PASS | Service policy tests; sample browser assessment; failed assessment HTTP test |
| AC-003 all-workshops unlock and section isolation | PASS | Service tests and real HTTP/Mongo; browser showed level 2 only after both level 1 completions |
| AC-004 persisted/authenticated/idempotent commands | PASS | HTTP/Mongo verifier rejects locked starts, completion before start, invalid page ownership, forged body identity, profile progress PATCH and disallowed origin; duplicate completion counted once |
| AC-005 traversal and reload | PASS | Hosted reader showed both lessons; full reload retained two completions and level 2 |
| AC-006 error/retry/sample | PASS | Remote tests preserve checkbox/answer after failed writes; reset endpoint replays isolated example |
| Service tests | PASS | `npm test -- --runInBand`: 4 suites, 35 tests |
| Remote tests | PASS | ChromeHeadless: 22 tests (includes retained starter reference tests) |
| Architecture and strict source types | PASS | check:architecture; tsc --noEmit --noUnusedLocals --noUnusedParameters |
| Backend/remote/contract builds | PASS | GENERATE_OPENAPI=true npm run build; production ng build; contracts gen/build |
| Real local service | PASS | `npm run test:workshop-example:http` against loopback and isolated Mongo |
| Hosted shell integration | PASS, sample only | beta shell used existing localhost:4201 remote override and local example API on 3004 |
| Live account integration | PENDING | Existing live progress endpoint returned 404; new service not deployed/configured |

Build warnings concern retained starter files no longer rendered by App. A verification build overlapped with the existing watcher and temporarily left stale chunk references; restarting `dev:bundle` restored one consistent output owner. Use an isolated output path for future verification builds while watching. No outstanding compiler/test failures. Earlier implementation compiler issues were corrected before final builds.

## How to inspect/replay
The local service is running via `npm run start:workshop-example` in service-user-metadata. The bundle watcher/static server on port 4201 was restarted and serves the consistent rebuilt remote. Open:
https://beta.ngx-workshop.io/workshops/hello-world?workshopExample=local

The verifier leaves level 2 unlocked. Standalone verification of reset and the final typed initial assessment form also passed at http://localhost:4201/?workshopExample=local. The hosted sign-in session expired during the final reload; use the standalone link directly or sign in normally to use the beta shell. Use Reset local example to start again, take the initial assessment, and complete both foundation workshops. Reset removes only synthetic learning state, not profile records. Screenshot: [verified-example.jpg](verified-example.jpg).

If restarting, run local Mongo then the service command above. See [service guide](../../../service-user-metadata/docs/workshop-progression.md) and local development guide.

## Contract and delivery handoff
- Generated `@tmdjr/user-metadata-contracts` 0.0.2 is installed from `vendor/tmdjr-user-metadata-contracts-0.0.2.tgz`. Root model and OpenAPI type exports remain available. The artifact is packed locally and is not published.
- Deploy service-user-metadata with trusted DOCKER_NET_NAME_DOCUMENT and DOCKER_NET_NAME_ASSESSMENT API prefixes, example/local flags disabled. The gateway must forward /api/user-metadata/workshop-progress and session credentials.
- Live test taking stays in the existing /take-assessment-test journey; learners return and refresh progress. No other remote is nested/loaded by this remote.
- Deployment/publication are X001 and were not performed. Live verification next: a signed-in user takes a section's real assessment, starts the unlocked workshop, completes the level, reloads and confirms persistence.

## Context maintenance
Architecture/development docs and feature index updated. Service README links the storage/API/local example/live rollout guide. App/Routes/federation exports and hello-world route remain compatible.


## Deployment configuration follow-up
Renamed upstream settings to DOCKER_NET_NAME_DOCUMENT and DOCKER_NET_NAME_ASSESSMENT; values remain full HTTP base URLs. The service-user-metadata workflow now passes both repository secrets through validation into the protected runtime environment file used by docker run. Updated runtime references, service tests and both repositories' configuration docs. Verified 35 service tests, backend build, workflow YAML parsing and execution of the environment-generation block with synthetic configuration (including missing/invalid URLs and file mode 0600). No remote deployment or network change was performed. Operators must set the new GitHub secrets and redeploy; the network inspection/connection commands are documented in the service guide.

## Workshop page editor follow-up
Added the same ngx-editor-js2 version as the document editor. Reader passes blocks and requestBlocks=null, with no saving outputs connected. Page loads clear the previous editor; errors retain retry and empty pages show a placeholder. The library remains editable as requested, with a temporary-edit notice. Browser verification showed the local Components page inside the editor, accepted a temporary edit, and restored the original content after back/resume. Screenshot: [verified-editor.jpg](verified-editor.jpg). All 23 ChromeHeadless tests, architecture checks, strict source type checks and isolated production build passed. Existing unused starter-file build warnings remain. Backend contracts and deployment configuration were unchanged in this follow-up. Readonly support remains future library work.

## Automatic completion follow-up (supersedes self-attestation above)
The checkbox and complete button are removed. An authenticated POST pages/:pageId/seen records a distinct workshop/page pair after the remote decodes and renders a page. The server validates started status, eligibility, page membership and retrievable content; duplicates are atomic/idempotent. Catalog derives completion from every current page and every exact assessment resourceId with completed status, even for a failed grade. Without references, the section initial assessment satisfies the assessment condition. Refresh after returning from a live test reconciles completion and levels. No automatic coding-lab grading is included. Empty workshops do not auto-complete. Legacy completedWorkshopIds are ignored as evidence: prior self-attested completions can return to in-progress.

DTOs now expose page/assessment counts and IDs. Contract 0.0.53 was generated, packed and installed from vendor; publication remains pending. Deploy service and remote together, ensuring the gateway forwards POST workshop page seen routes. The old complete endpoint validates requirements and cannot bypass them. No live deployment was performed.

Verification: 41 service tests; 11 active ChromeHeadless tests; architecture and strict source types; service/generated-contract/isolated remote production builds; real local HTTP/Mongo verifier. The full frontend test command initially failed on obsolete tests importing removed seed source. Test configuration now excludes those retired specs and fixture, and the default test command passes. Browser verification showed 1/2 then 2/2 pages, no completion before the referenced test, reload persistence, then automatic completion on assessment submission. Screenshot: [verified-auto-completion.jpg](verified-auto-completion.jpg).
