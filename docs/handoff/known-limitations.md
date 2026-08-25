# Known Limitations

Claude Code records engineering caveats and deferred work here as they arise. Not for product/design ambiguities — those go in `docs/handoff/questions-for-codex.md`.

## Backend

- **`Microsoft.OpenApi` NU1903 advisory (high severity, GHSA-v5pm-xwqc-g5wc).** `Microsoft.AspNetCore.OpenApi 10.0.10/10.0.11` (the latest stable on .NET 10 as of 2026-08-25) depends on `Microsoft.OpenApi 2.x`, and every 2.x release carries this advisory; pinning `Microsoft.OpenApi` to a patched 3.x release breaks `Microsoft.AspNetCore.OpenApi`'s source generator (`IOpenApiMediaType.Example` becomes read-only, build fails). The vulnerability is in OpenAPI schema/example parsing used by the dev-time `/openapi` document generator, not in request handling. Left unpinned for now; revisit when Microsoft ships an `Microsoft.AspNetCore.OpenApi` build compatible with a patched `Microsoft.OpenApi`.
- Contract "one overlapping Active contract per property" and date-range validity are enforced in the `ContractService` application layer (interval-overlap queries), not as a database constraint — Postgres exclusion constraints could enforce this at the DB layer too but weren't added to keep the schema comprehensible per the implementation brief's guidance against over-engineering.
- Seed data (`DbSeeder`) only runs when `ASPNETCORE_ENVIRONMENT=Development` and only if `Users`/`Properties` are empty; it is not wired for a fresh production-style bring-up path yet.

## Frontend

- `/login`, `/overview`, `/properties`, and `/digital-twin` are wired to real API calls and (for login/properties) pixel-matched to the approved Figma frames via the MCP connection. `/properties/:id`, `/tenants`, `/contracts`, `/payments`, `/maintenance` are still unstyled placeholders pending the same treatment.
- Build size: the production bundle is ~1.3 MB (gzip ~363 KB) as of the Digital Twin addition, mostly `three`/`@react-three/fiber`/`@react-three/drei`. Not code-split yet (Vite's chunk-size warning fires) — consider lazy-loading the `/digital-twin` route with `React.lazy` if initial load time becomes a concern.

## Digital Twin (`/digital-twin`, added 2026-08-25)

Built per `docs/estateos/claude-threejs-implementation-spec.md`. Core scene, layout, materials, camera state machine, interaction, filters/modes, a11y, and loading/error/fallback states are implemented and manually verified (see `docs/handoff/test-report.md`). Deferred against the full spec:

- **No `EffectComposer`/`OutlinePass`.** Selection is communicated via the ground-plane ring geometry the spec explicitly allows as an alternative ("outline/ring instead of recoloring"), plus the hover emissive boost. If a future pass wants the crisper edge-outline look from the reference concept art, `OutlinePass` would need to be added (no new dependency required — it ships with `three`).
- **Facade detail (window/reveal lines, curtain-grid) is not implemented.** Each archetype gets one structural cue (stepped roof, crown band, split volumes, entry notch) instead of the instanced facade module lines the spec describes. Draw calls are comfortably within the High-tier budget (180) at the current 60-property scale without this detail or `InstancedMesh`; both should be revisited if the portfolio grows toward the spec's 200-property upper bound.
- **No dev-only diagnostics adapter** (property ID / world position / camera mode / quality tier / draw-call count). FPS and draw-call numbers were not formally benchmarked against the spec's "10-second representative run" acceptance criterion — only visually inspected during manual testing.
- **Assembly choreography is simplified**: buildings rise with a district/index-staggered cubic-out scale animation, but the six-stage timed sequence in the spec (grid draw-in, district anchor lines, facade resolve, status activation, toolbar-ready signal as separate timed phases) is not separately implemented — the overall effect (buildings emerging staggered by district) is present, the sub-second phase boundaries are not.
- **Camera transition duration is damping-based**, not an exact-seconds tween. `CameraControls`' `smoothTime` approximates the spec's ~0.72–0.85s targets rather than hitting them precisely.
- **Test coverage gap**: unit tests cover layout determinism/collision spacing, status/mode material mapping, and camera target/distance bounds. The spec's broader contract (Playwright suite as committed test files, WebGL context-loss fallback test, URL-hydration test, mobile first-tap test, quality-tier/reduced-motion unit tests) was exercised manually this session but not written as repeatable test files. See `docs/handoff/test-report.md`.
- **Occupancy percent is always `null`** — the API has no per-unit occupancy concept, so the label/panel correctly omit it (per the spec's "render null instead of inventing it") rather than showing a fabricated number.
