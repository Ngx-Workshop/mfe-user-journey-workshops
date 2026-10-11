# Architecture and external context
Updated 2026-10-10 for [002 workshop progression](../specs/002-workshop-progression/spec.md).

## Responsibilities and source map
The remote owns the learner workshop catalog and basic reader. The former example-document source has been removed; its leftover tests are excluded from the active test configuration.

- `src/app/app.ts`, `app.routes.ts`: public composition and route exports.
- `features/workshop-journey/api`: stateless HTTP client.
- `features/workshop-journey/state`: root store, server snapshot, loading/error/write state.
- `features/workshop-journey/pages/journey`: scoped VM, typed assessment control, current workshop/page, command streams and composition.
- `features/workshop-journey/components`: typed reader inputs and user intent outputs.
- `features/workshop-journey/utils`: error/block mapping. Workshop pages render with `@tmdjr/ngx-editor-js2` 21.0.9, matching the document editor. Serialized blocks retain their identities, types, content and saved actions; legacy HTML is adapted to a paragraph block. No trusted-HTML bypass or document-save handler.
- `testing/app` mirrors runtime; synthetic fixtures live in `testing/fixtures`.

Reads use switchMap; revision checks prevent an older catalog response from overwriting a successful mutation. Commands use exhaustMap and lifetime-bound subscriptions. Failed page-progress saves retain the lesson and offer retry; failed assessment preserves its answer. The singleton store depends on HTTP, not Router/forms/Material. The scoped VM owns navigation/form state.

## Federation and providers
Preserve named/default App, named Routes, `./Component`, `./Routes`, `remoteEntry.js`, and the empty-path redirect to `overview`. Angular/Material/CDK 21.1.0 and existing shared versions remain. Host supplies HTTP/session interceptors and Router. Standalone bootstrap renders App directly; optional Router is used only to retain example mode in the hosted URL. Production webpack retains the starter's module-concatenation repair.

## Data ownership and policy
Document service owns section IDs, workshop levels and journey entries. Assessment service owns live initial results. User metadata service owns a separate `workshop_progress` collection keyed by authenticated UUID; the profile schema is unchanged and profile PATCH cannot update progress.

Initial assessment completion unlocks max(1, highestPassedLevel), capped at level 20. Every workshop at the current configured level is required before advancing to the next configured level. Missing level defaults to 1; existing level gaps advance to the next actual level. Sections match by ID, never title. Viewed pages are distinct workshop/page pairs; repeated visits are idempotent. Completion is derived from distinct saved page visits and completed assessment-test references matched by exact resourceId. The initial section assessment suffices when no workshop assessments are referenced. No passing grade is required. Coding labs are not a completion criterion. Empty workshops with no pages/assessments do not complete automatically. Legacy self-attestation IDs cannot bypass the new criteria.

Only eligible incomplete workshops have start/resume cards. Completed names are shown in a separate expandable list. Reader and cards show page counts; page markers persist after reload. The reader emits seen intent after a successfully decoded lesson renders, and the scoped VM serializes visit writes. Server GET catalog reconciles authoritative assessment completion on refresh. The server rechecks eligibility for start, completion and its reader endpoint. Existing public document-service endpoints retain their own access policy; this feature does not turn public documents into private resources.

## HTTP contracts
The generated `@tmdjr/user-metadata-contracts` 0.0.53 types are installed from the checked-in local tarball in vendor. They are generated from service-user-metadata OpenAPI; publication is pending. No backend DTO is recreated in this remote.

| Method | Browser path | Response |
| --- | --- | --- |
| GET | /api/user-metadata/workshop-progress | WorkshopProgressDto |
| POST | …/workshops/:id/start | WorkshopProgressDto |
| POST | …/workshops/:id/pages/:pageId/seen | WorkshopProgressDto |
| POST | …/workshops/:id/complete | Validating compatibility endpoint; no completion override |
| GET | …/workshops/:id/pages/:pageId | WorkshopReadingDto |

The explicit local example substitutes `http://localhost:3004/user-metadata/workshop-progress` and adds POST `example-assessments/:sectionId` and POST `example-reset`. These sample commands return 404 outside explicit isolated example mode. The backend guards loopback/origin/database and uses the existing synthetic local identity. No live initial test is faked: live test links use `/take-assessment-test/overview?view=subject&subject=<section ID>`. Coding-lab references now link to the learner lab remote at `/coding-labs/hello-world` with exact resource and return context. Coding lab grading remains owned by its services.

Backend upstreams `DOCKER_NET_NAME_DOCUMENT` and `DOCKER_NET_NAME_ASSESSMENT` must be configured with trusted API prefixes. Server forwards only session Cookie and Authorization, and never a client-selected upstream. See the service guide for rollout. Existing service/gateway deployment is external integration work.

The remote sends POST workshops/:id/pages/:pageId/seen to record rendered pages and consumes the resulting catalog. The old complete route remains a validating compatibility endpoint and cannot override prerequisites. Completion statuses are derived; persisted page visit pairs provide the evidence. Deploy the new service before using this remote version.

## Workshop continuity — 2026-10-11

See [003 continuity](../specs/003-workshop-continuity/handoff.md). Workshop reader route is `/workshops/overview`, matching its executable Routes. Activities accept `returnTo` (validated to that reader route and workshop/page query keys) and `workshopName`. Assessments accept an exact `test` definition ID; labs accept an exact published `lab` ID. Activity navigation merges query context; return reloads the server catalog and restores the lesson. No automatic starts or altered completion policy. Host Router owns cross-remote navigation; no nested remotes.

### Workshop overview refinement
`components/workshop-catalog.component.ts` owns typed catalog presentation; `workshop-section.component.ts` presents placement and ordered level groups. Scoped JourneyViewModel owns overview filter/search state. Completed workshop retake uses the reader GET, preserving server completion and unlocked levels. Local preview controls are absent from learner UI; development examples remain URL opt-in. No live progress reset or assessment-history deletion is performed.

### Automatic workshop return
Workshop context now returns automatically on confirmed assignment submission: assessment finish or a completed coding-lab submit response. Return uses the validated workshop/page destination with replaceUrl. Save-only, failures and historical loads keep their current views; ordinary result navigation remains for assignments without workshop context. Workshop return reloads authoritative progress. Learner copy explains the automatic return.

### Direct workshop assignment links
Explicit resource links include `launch=direct`. After authoritative catalog/history loading, the scoped activity VM starts or resumes the exact eligible resource once, removes launch on internal navigation, and preserves returnTo/workshopName. Assessment completed references open saved results. Missing/locked resources and failed starts do not loop; explicit Refresh retries. This supersedes discovery-only entry for workshop assignment links. Ordinary discovery and placement remain available.
