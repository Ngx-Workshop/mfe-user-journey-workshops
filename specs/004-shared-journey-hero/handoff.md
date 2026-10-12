# Handoff: shared journey hero

Status: Complete · Updated: 2026-10-12
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)

## Delivered behavior

The shared library exports `NgxJourneyHero` and readonly `NgxJourneyHeroTag`.
Required title and optional kicker/subtitle/description/continuation/tags/art inputs
make the hero reusable without workshop copy. Namespaced color overrides fall
back to Material system tokens. Embers, artwork sway, responsive rules, pause and
reduced-motion behavior are preserved from the user's working tree baseline.
`WorkshopHeroComponent` is now a small OnPush content/theme adapter.

## Verification

| Check | Result |
| --- | --- |
| Library `npm run ngx-shared-headers:build` | PASS |
| Library `npm test -- --project=ngx-shared-headers --watch=false` | PASS: 4 tests |
| Remote `npm test -- --watch=false --browsers=ChromeHeadless` | PASS: 17 tests |
| Remote focused hero suite after copy assertions | PASS: 3 tests |
| Remote `npm run build -- --output-path dist/shared-hero-verification` | PASS |
| Remote `npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json` | PASS |
| Remote `npm run check:architecture` | PASS; existing component-size notices |
| Final vendor runtime/declarations/manifest versus installed package | Identical |

Unit checks use synthetic data. No signed-in hosted walkthrough or new visual
preview was run for this extraction; responsive and reduced-motion CSS was moved
with the existing implementation. The initial build command was launched from the
organization folder and failed for missing package.json; rerun from the producer
checkout passed. npm's unrelated optional dependency pruning was excluded from
the committed lockfile change.

## Consumer and release contract

Producer version 21.0.2 adds Angular Material ^21.1.0 as a peer; Angular common/core
remain ^21.1.0. Existing NgxParticleHeader export is preserved. Consumer package.json
and lockfile use `file:vendor/tmdjr-ngx-shared-headers-21.0.2.tgz`. This allows builds
without registry publication or sibling-source aliases. Shared presentation is
bundled into this remote; it does not need a federation singleton.

Publication/deployment was outside this request. For a later registry release,
publish the producer first, replace the consumer file dependency with the released
version and verify its build/tests. No source implementation work remains.

Architecture/development docs, feature index and library API guide were updated.
Existing continuity documentation edits were preserved.

## Independent visuals follow-up — 2026-10-12

Completed: shared layout NgxHero projects independent background/art components.
NgxJourneyHero now composes it with NgxHeroEmbers/NgxHeroChapterArt, preserving its
public inputs, particle data and pause signal. Assessment composes it with a local
scanning-grid background and assessment-sheet artwork. Both consumers adopt vendor
21.0.3. The earlier 21.0.2 delivery above is superseded. The former single-component
size exception is no longer needed: responsibilities are split into focused components.

PASS: 6 library tests, 41 assessment tests, 17 workshop tests, all producer/consumer
production builds, both source type/unused checks and workshop architecture guard.
The focused workshop suite passed again after assertions for computed pause state
on both projected decorations. True 1366px/390px optimized standalone render checks
show no horizontal overflow, phone art hidden and reduced-motion background/toggle
hidden with art animation disabled. Both desktop/phone screenshots were reviewed.
Static preview APIs were unavailable; no hosted integration is claimed.

See the assessment [007 handoff](../../../mfe-user-journey-assessment-test/specs/007-shared-hero/handoff.md)
for cross-consumer verification, or the shared library API guide for slot/motion
contracts. Registry publication/deployment remains outside the request.
