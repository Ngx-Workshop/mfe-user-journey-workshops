# Implementation plan: Workshop progression
Status: Implemented; live integration pending
Updated: 2026-10-10
Spec: [spec.md](spec.md)

## Baseline and design
Clean working trees. Existing workshops remote is the MVVM starter. Assessment learner catalog exposes completedCount/highestPassedLevel and section subject IDs; document navigation exposes sections/workshops/level/journey entries.

| Requirement | Design |
| --- | --- |
| FR-001–003 | Aggregate catalog in user metadata service using document and authenticated assessment APIs; derive eligibility from results and stored completed IDs. |
| FR-004 | Separate unique-user progress schema, atomic addToSet writes, server validation; no editable unlockedLevel. |
| FR-005 | Scoped journey VM selects eligible workshop; typed outline/reader, explicit completion. |
| FR-006 | Stateless API, singleton switchMap refresh store, exhaustMap commands with lifetime cleanup; explicit loopback sample API guarded by existing local mode. |

## Contracts and delivery
Add GET user-metadata/workshop-progress, POST workshops/:id/start and /complete, GET workshops/:id/pages/:pageId. Add local-only sample assessment and reset POST commands. Existing profile schema/API remains unchanged. Generate OpenAPI/types and pack versioned local contract for the remote; publishing remains external. Production gateway must forward the user-metadata prefix. Upstream URLs are configured server-side; only session cookies/Authorization go to the configured assessment service.

## Constitution review
MVVM, feature folders, host exports, inline BEM and server-owned data satisfied. Sample definitions exist only in the service and activate through explicit local development flags. No nested remote. Production integration depends on running the new service version and its upstream configuration.

## Verification
Meaningful policy tests: assessment gate, failed placement, higher placement, section isolation, all-workshops requirement, gaps, legacy default level. Service command tests: rejected locked IDs, duplicate writes, profile isolation. Remote HTTP/store/view tests: eligibility rendering, errors, retries and traversal. Architecture/types/build and ChromeHeadless. Local HTTP integration on real isolated Mongo, then inspect hosted shell using its local remote override.

## Frontend architecture
features/workshop-journey/{api,models,state,utils,pages/journey,components}. API owns HTTP; singleton store server snapshot/commands; scoped VM selection/content; components compose/present. Replaceable reads use switchMap; duplicate-sensitive commands use exhaustMap. No new global providers required in host.

## Editor rendering follow-up
Use NgxEditorJs2Component directly in the typed reader, with blocks input and requestBlocks=null. The scoped VM maps the page response to NgxEditorJsBlock[] and clears blocks during replacement reads, removing the previous editor while loading. No output handler or save API is added. Preserve the document editor block payload and adapt legacy HTML to a paragraph block. Use a placeholder block for empty pages because the library inserts a default heading for an empty array. Verify actual block rendering, malformed payload rejection, existing progression tests and temporary edits through reopen in the local browser.
