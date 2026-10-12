# Implementation plan

Use scoped journey view models for additive query navigation: workshop/page, assessment test, coding lab, returnTo and workshopName. Each remote remains independently deployable; no nested remotes or new shared package. Validate returnTo against /workshops/overview with only workshop/page parameters. Keep existing API clients and singleton stores.

Workshop presentation adopts existing lab/assessment hero and theme foundations, an ordered contents rail and next activity. Activity pages display a consistent return banner, filter exact resources, preserve context across existing views and never auto-start a write. Restore workshops after catalog load, fetch the selected lesson and reconcile progress on return.

Constitution: MVVM, OnPush, inline BEM, theme tokens, lifetime cleanup and federation interfaces preserved. Existing large App/workshop composition components remain cohesive composition exceptions; reader responsibilities split into activity outline. Verify meaningful navigation/restore regressions, existing failure/save suites, architecture guards, types and isolated production builds. Hosted auth/gateway walkthrough is separate integration evidence.

## Overview refinement
Extract catalog and section presentation components under components; VM owns view/search signals. Section derives level groups with in-progress workshops first, then sortId/name. Completed view exposes retake; VM opens the first lesson without a server mutation. Local example query entry stays for development; remove its switches/reset UI from composition. No backend changes. Verify rendered filters, ordering, developer-control absence, and completed reader reopening with HTTP doubles plus desktop/mobile screenshots.

### Automatic completion return
Assessment runner's confirmed completion event routes to validated returnTo instead of result when launched from workshops. Coding VM redirects only for the active submit command returning completed status; capture the launch destination so an unrelated route cannot redirect stale work. No redirect for save/load/error or a noncompleted response. Use replaceUrl to avoid leaving a just-submitted assignment as the immediate browser-back destination. Preserve existing result/history flows without workshop context. Workshop constructor already reloads the authoritative catalog and restores page selection. Verify success, retry, invalid context, standalone results and historical loads with HTTP/Router doubles; signed-in shell walkthrough remains external integration.

### Direct assignment entry
Add launch=direct to workshop resource URLs. Scoped VMs resolve exact catalog resource after loading, consume each launch key once, reuse known active/assessment completed attempts, otherwise issue existing start commands. Internal navigation removes launch while merging workshop return context; direct attempt navigation replaces the launch entry. Explicit Refresh retries a failed launch. Show opening progress while start is pending; ordinary discovery remains unaffected. Validate direct start/resume, missing/locked resources, retry and preserved return context through HTTP/Router tests.

### Canonical lab route
Update JourneyViewModel.labUrl to /coding-labs/explore; reader/outline activityUrl composition inherits the canonical base. Preserve resource and workshop query context. Extend the existing continuity regression to verify the target and composed reader URL; run workshop tests, architecture/types and an isolated production build. No external writes or API changes.

### Canonical assessment route
JourneyViewModel.assessmentUrl encodes the section ID into subjects/:subjectId, removing view/subject query selectors. Existing activityUrl composition retains exact test/direct launch and workshop context. Extend the existing continuity regression for the canonical path, encoded identity and shared reader URL composition; verify tests/architecture/types and isolated build.

### Hero embers
Keep the effect in the standalone OnPush workshop hero, using 72 deterministic particle configurations and inline BEM styles. CSS animates transforms/opacity only, with negative delays for immediate steady-state density; no canvas, timers, dependencies or runtime randomness. Full-height particle tracks make upward travel relative to the actual hero height. Material system tokens drive glow/color, including theme changes. Isolate and clip the background; layer copy/artwork above it. Reduce phone density by half.

Use individual CSS translate/rotate for artwork sway to preserve its existing tablet transform scale. A local signal controls pause/resume; reduced-motion CSS disables decoration and animation. No API/store/VM or public contract changes. The already oversized hero remains a cohesive inline HTML/SCSS presentation component; extra styling is kept here rather than split solely to meet a line count.

Verify AC-011–013 with a mirrored hero component spec, architecture/types, an isolated optimized build, and synthetic local browser checks at desktop/tablet/phone sizes, theme-token changes, pause/resume and reduced motion. No external repository changes are required; existing signed-in journey integration remains X001.

For FR-015 / AC-014, skew deterministic origins right using a square-root distribution and apply a left-to-right opacity mask to the whole decorative layer. Center both palette glows on the right. This creates a density/brightness gradient toward the left without reversing the existing particle motion. Test the >=70% right-half threshold for both 72 desktop and 36 phone origins and inspect the rendered gradient at both widths.
