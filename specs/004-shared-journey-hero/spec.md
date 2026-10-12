# Shared journey hero

Status: Complete · Created: 2026-10-12

The workshop hero currently owns reusable presentation and fixed learner copy.
Extract the presentation to @tmdjr/ngx-shared-headers while retaining workshop copy locally.

## Requirements and acceptance
- FR-001 / AC-001: A different journey supplies title, kicker, subtitle, description, tags and art text/icon through typed inputs, without workshop copy in the shared library.
- FR-002 / AC-002: The workshop overview retains its copy, 72 staggered embers, responsive artwork, pause/resume toggle and reduced-motion CSS.
- FR-003 / AC-003: Both projects build using the packaged public API. Existing particle-header export remains compatible.

No server, route, data or authentication behavior changes. No publication or deployment requested.
Assumption: retain a small workshop wrapper to own content and map its theme tokens.

## Independent visuals follow-up — 2026-10-12

FR-004 / AC-004: A shared layout supports independent projected background and
artwork. NgxJourneyHero uses the ember/chapter composition; assessment uses scanning
grid/sheet composition. Existing workshop copy, motion, theme and public inputs
remain compatible. The single pause button reaches both projected components.
