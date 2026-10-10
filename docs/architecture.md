# Architecture and external context
Updated 2026-10-10 for [002 workshop progression](../specs/002-workshop-progression/spec.md).

## Responsibilities and source map
The remote owns the learner workshop catalog and basic reader. The former example-document starter remains in the checkout as reference code/tests but is no longer rendered by App.

- `src/app/app.ts`, `app.routes.ts`: public composition and route exports.
- `features/workshop-journey/api`: stateless HTTP client.
- `features/workshop-journey/state`: root store, server snapshot, loading/error/write state.
- `features/workshop-journey/pages/journey`: scoped VM, typed assessment control, current workshop/page, command streams and composition.
- `features/workshop-journey/components`: typed reader inputs and user intent outputs.
- `features/workshop-journey/utils`: error/block mapping. Workshop pages render with `@tmdjr/ngx-editor-js2` 21.0.9, matching the document editor. Serialized blocks retain their identities, types, content and saved actions; legacy HTML is adapted to a paragraph block. No trusted-HTML bypass or document-save handler.
- `testing/app` mirrors runtime; synthetic fixtures live in `testing/fixtures`.

Reads use switchMap; revision checks prevent an older catalog response from overwriting a successful mutation. Commands use exhaustMap and lifetime-bound subscriptions. Failed completion preserves the selected workshop and confirmation; failed assessment preserves its answer. The singleton store depends on HTTP, not Router/forms/Material. The scoped VM owns navigation/form state.

## Federation and providers
Preserve named/default App, named Routes, `./Component`, `./Routes`, `remoteEntry.js`, and the empty-path redirect to `hello-world`. Angular/Material/CDK 21.1.0 and existing shared versions remain. Host supplies HTTP/session interceptors and Router. Standalone bootstrap renders App directly; optional Router is used only to retain example mode in the hosted URL. Production webpack retains the starter's module-concatenation repair.

## Data ownership and policy
Document service owns section IDs, workshop levels and journey entries. Assessment service owns live initial results. User metadata service owns a separate `workshop_progress` collection keyed by authenticated UUID; the profile schema is unchanged and profile PATCH cannot update progress.

Initial assessment completion unlocks max(1, highestPassedLevel), capped at level 20. Every workshop at the current configured level is required before advancing to the next configured level. Missing level defaults to 1; existing level gaps advance to the next actual level. Sections match by ID, never title. Completed workshop IDs are sets; duplicate completion is idempotent. Completion is explicit learner self-attestation in this iteration, including referenced exercises. It is not automatic lab/assessment mastery verification.

Only eligible incomplete workshops have start/resume cards. Completed names are shown in a separate expandable list. The server rechecks eligibility for start, completion and its reader endpoint. Existing public document-service endpoints retain their own access policy; this feature does not turn public documents into private resources.

## HTTP contracts
The generated `@tmdjr/user-metadata-contracts` 0.0.2 types are installed from the checked-in local tarball in vendor. They are generated from service-user-metadata OpenAPI; publication is pending. No backend DTO is recreated in this remote.

| Method | Browser path | Response |
| --- | --- | --- |
| GET | /api/user-metadata/workshop-progress | WorkshopProgressDto |
| POST | …/workshops/:id/start | WorkshopProgressDto |
| POST | …/workshops/:id/complete | WorkshopProgressDto |
| GET | …/workshops/:id/pages/:pageId | WorkshopReadingDto |

The explicit local example substitutes `http://localhost:3004/user-metadata/workshop-progress` and adds POST `example-assessments/:sectionId` and POST `example-reset`. These sample commands return 404 outside explicit isolated example mode. The backend guards loopback/origin/database and uses the existing synthetic local identity. No live initial test is faked: live test links use `/take-assessment-test/overview?view=subject&subject=<section ID>`. Coding-lab references are displayed; a learner lab remote is not available in this workspace, and automatic exercise grading is outside this iteration.

Backend upstreams `DOCKER_NET_NAME_DOCUMENT` and `DOCKER_NET_NAME_ASSESSMENT` must be configured with trusted API prefixes. Server forwards only session Cookie and Authorization, and never a client-selected upstream. See the service guide for rollout. Existing service/gateway deployment is external integration work.
