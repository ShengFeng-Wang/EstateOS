# Test Report

## Digital Twin (2026-08-25)

### Automated — Vitest unit tests

`frontend/src/features/digital-twin/tests/` — 14 tests, all passing (`npm run test`):

- `cityLayout.test.ts` (4): layout determinism across repeated calls; positions unaffected by input array reordering (proxy for "filtering/sorting doesn't reposition"); minimum footprint spacing respected for a dense same-district set; different districts land in distinct anchor regions.
- `statusAppearance.test.ts` (6): each status maps to its approved palette color; occupancy mode leaves the base appearance unchanged; revenue mode falls back to neutral when revenue is unavailable and scales emissive intensity within the documented `0.05–0.22` bounds; contract mode flags `ExpiringSoon`; maintenance mode buckets open counts into three increasing intensities.
- `cameraTransitions.test.ts` (4): portfolio mode returns the fixed spec position/target; district camera distance clamps to `[18, 34]`; property camera distance clamps to `[9.5, 18]` based on building height; property target sits at 42% of building height.

### Manual — Playwright-driven browser walkthrough (this session, not committed as a spec file yet)

Run against the local dev stack (backend + Vite dev server, seeded 60-property portfolio), full-page Chromium at 1440×1024:

| Check | Result |
|---|---|
| Login → `/digital-twin` renders a canvas | Pass |
| Scene shows an oblique dark city with height/color-varied buildings, no console/page errors | Pass |
| Hover a building → label appears with code + city/district | Pass |
| Click a building → camera transitions to property focus, selection ring renders, selection panel shows correct property data | Pass |
| `AssetListMirror` row highlights in sync with the 3D selection | Pass |
| Status filter (`Vacant` only) dims non-matching buildings without moving any building | Pass |
| Switching to `Revenue` mode changes material appearance + legend without moving buildings | Pass |
| Selecting a property via the DOM list mirror and clicking "Open property" navigates to `/properties/{id}` | Pass |

### Not yet covered — gap against the spec's full testing contract

The spec (`docs/estateos/claude-threejs-implementation-spec.md`, "Testing contract") asks for a broader Playwright suite committed as test files (deterministic-fixture pointer-coordinate selection, search-to-focus, mode/filter location-stability via a dev-only hook, reduced-motion run assertions, mobile first-tap flow) plus component/integration tests (WebGL context-loss fallback, URL hydration, keyboard Escape/back-level behavior) and additional unit coverage (collision resolution under forced conflicts, quality-tier resolution, reduced-motion behavior). These were exercised manually this session (see table above) but not written as committed, repeatable test files — tracked in `docs/handoff/known-limitations.md`.

No dev-only diagnostics adapter (property ID / world position / camera mode / quality tier / draw-call count) was built, so FPS and draw-call numbers were not formally measured — visual inspection at the current 60-property scale showed no dropped frames or stutter during interaction on the development machine, but this is not the recorded 10-second representative benchmark the spec's acceptance criteria call for.
