# Plan: shared journey hero

Status: Complete · Updated: 2026-10-12
Spec: [spec.md](spec.md)

Add standalone OnPush NgxJourneyHero and NgxJourneyHeroTag to the library public API.
Signal inputs own content; component-local signal owns pause state. Use namespaced
CSS overrides with Material theme fallbacks so other journeys need no workshop CSS.
Preserve existing decorative layout and motion. Keep inline HTML/styles together;
the cohesive shared illustration/style is an intentional component-size exception.

Build producer version 21.0.2 first, then package into consumer vendor/ and install
that immutable archive (existing local contract packaging convention). Add Material
peer dependency because the hero renders Material icons. No sibling source paths or
federation singleton required for the stateless shared presentation.

Verify library input/motion tests, consumer hero/full tests, architecture guard and
isolated production build. Unit tests are synthetic; no signed-in host deployment
is claimed. Existing uncommitted motion changes are the extraction baseline.

## Independent visuals follow-up

NgxHero owns layout and pause state; NgxHeroEmbers/NgxHeroChapterArt own decoration.
NgxJourneyHero composes them and preserves its original API. Native Angular attribute
projection slots permit other journeys to supply arbitrary artwork/backgrounds. CSS
animation state inherits through the actual DOM; each component honors reduced motion.
Components now fit approximately 230 lines after splitting distinct responsibilities.
Adopt vendor version 21.0.3 in both consumers; keep unrelated lockfile entries intact.
