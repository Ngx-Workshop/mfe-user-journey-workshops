# Workshop continuity handoff
Status: Implemented; hosted integration pending
Updated: 2026-10-11

## Delivered
Workshop catalog adopts the assessment/lab hero, theme aliases, gutters, footer and panels. Reader separates ordered contents from lesson content, identifies optional labs, preserves page-save retry, and continues to the next activity (skipping completed assessments). Assessment links select exact test IDs; lab links select exact published lab IDs without automatically starting attempts. Unavailable references have explicit recovery states.

Both activity journeys retain workshopName and a validated returnTo through start/resume/history/results. Return restores workshop/page and reloads server progress. Assessment return is disabled during an active runner until Save & exit or submission; labs protect unsaved code and confirm once across the route exit guard. Normal workshop activity clicks use the host Router; modified clicks retain native links. Standalone labs now install their exported Routes so query navigation works.

## Verification
- PASS: 12 ChromeHeadless tests in this repository using HTTP doubles. Combined total: 51 (12 workshops, 17 labs, 22 assessments).
- PASS: isolated optimized federation build at /tmp/mfe-user-journey-workshops-continuity-build.
- PASS: source TypeScript including unused symbols; git diff --check.
- PASS: architecture guards in workshops and labs. Assessment repository has no architecture command; its MVVM, typed inline BEM and mirrored test conventions were reviewed.
- PASS: eight synthetic browser previews covering catalog, reader, exact assessment and exact lab at 1366px and 390px. No page errors or horizontal overflow. Rendered resource links and return banners checked. Previews use local HTTP doubles; no live attempt mutations.

## Contracts and discrepancies
Additive query parameters: workshops workshop/page; assessment test; labs lab; activities returnTo/workshopName. Return allows only /workshops/overview and workshop/page parameters. API DTOs, scoring, server completion criteria and federation exports are unchanged. Labs remain optional practice.

Executable workshop Routes use overview; earlier docs referred to hello-world. New links use the executable overview route. Coding labs README confirms /coding-labs/hello-world; assessments use /take-assessment-test/overview. Hosted shell supplies cross-remote routes/session providers. Standalone previews do not validate cross-remote Router transitions.

## Remaining integration
X001: release all three compatible remotes, then verify signed-in placement → workshop lesson → exact assessment → result → return → optional lab → save/submit → return in the shell. Check refreshed completion and browser back/forward. No deployment, publication or production data change performed.

## Context
Architecture and development guides describe the additive navigation contract. Preview images alongside this handoff are synthetic review artifacts.
