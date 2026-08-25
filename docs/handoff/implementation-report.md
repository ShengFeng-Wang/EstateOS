# Implementation Report

## Digital Twin (2026-08-25)

### Scope delivered

A working React Three Fiber "Estate Digital Twin" at `/digital-twin`, per `docs/estateos/claude-threejs-implementation-spec.md`: portfolio-scale procedural city, deterministic layout, archetype massing, status/mode materials, bounded camera with a portfolio/district/property state machine, raycast hover/select, DOM keyboard mirror + selection panel, visualization modes, filters, quality-tier DPR scaling, reduced-motion support, loading/empty/error/WebGL-fallback states.

### Dependency changes

None. Uses the existing `three`, `@react-three/fiber`, `@react-three/drei` (`CameraControls`, `RoundedBox`, `Html`, `Grid`) already in `frontend/package.json`. No post-processing library added — selection uses ground-plane rings per the spec's "outline/ring" wording, not `EffectComposer`/`OutlinePass`.

### File map

```text
frontend/src/features/digital-twin/
  api/digitalTwinQuery.ts          adapts properties+contracts+maintenance into DigitalTwinProperty[]
  components/                      DigitalTwinCanvas, DigitalTwinScene, CityGround, DistrictGroup,
                                    PropertyBuilding, PropertyHitTarget, SelectionRing, PropertyLabel,
                                    SpatialToolbar, SpatialLegend, SelectionPanel, AssetListMirror,
                                    DigitalTwinFallback, DigitalTwinErrorBoundary
  geometry/buildingArchetypes.ts   footprint/height formulas, percentile normalization
  geometry/cityLayout.ts           deterministic seed/district/collision layout (pure, unit-tested)
  materials/statusAppearance.ts    palette + status/mode -> material appearance (pure, unit-tested)
  materials/buildingMaterials.ts   useBuildingMaterial hook (owns all material mutation/disposal)
  motion/useBuildingMotion.ts      per-building emergence animation (ref-mutated in useFrame)
  motion/cameraTransitions.ts      camera position/target per CameraMode (pure, unit-tested)
  state/digitalTwinStore.ts        Zustand: IDs and UI state only, no copied Property objects
  types/digitalTwin.ts
  utils/seededRandom.ts, qualityTier.ts, spatialNavigation.ts
  tests/cityLayout.test.ts, statusAppearance.test.ts, cameraTransitions.test.ts
frontend/src/routes/DigitalTwinPage.tsx   route composition: query, states, URL sync, a11y live region
backend: DbSeeder.cs expanded to a 60-property portfolio (see docs/handoff for the seed-data commit)
```

### State/data flow

TanStack Query (`fetchDigitalTwinProperties`) fetches `/api/properties`, `/api/contracts`, `/api/maintenance` (paginated, up to 400 records) and adapts them once into `DigitalTwinProperty[]` — the single source of building data; no parallel hard-coded 3D dataset. Zustand (`digitalTwinStore`) owns only hover/selection/filter/mode/camera IDs and enums. `visualizationMode`/`statusFilter`/`typeFilter` mirror into URL search params (`DigitalTwinPage`) for durability/shareability.

### Scene composition

~60 buildings (current seed), 1 ground mesh, 1 grid, up to 2 selection-ring meshes, 1-2 accessory meshes per Office/Retail/Townhouse/Apartment archetype cue. No `InstancedMesh` was needed at this scale to stay within the High-tier 180-draw-call budget (see Performance below); this is flagged in `docs/handoff/known-limitations.md` as something to revisit if the portfolio grows toward the spec's 200-property upper bound.

### Accessibility

- DOM asset list (`AssetListMirror`) mirrors the deterministic spatial order; arrow keys move selection, Enter opens detail.
- `Escape`/`R` handled globally (guarded against firing while an input has focus).
- Selection announced via a visually-hidden `aria-live="polite"` region.
- `prefers-reduced-motion` detected on mount and kept in sync via a `matchMedia` listener; reduced motion skips building-emergence and ring-expansion animation.
- A manual "Reduce motion" toggle exists in `SpatialToolbar` in addition to the OS preference.

### Verification performed this session

- Full Playwright walkthrough (see `docs/handoff/test-report.md`): login → digital-twin, hover raycast → label, click → camera transition + selection ring + panel, DOM list sync, "Open property" navigation. No console/page errors.
- `npm run build` (tsc + vite) clean.
- `npm run test` (Vitest) — see test report for coverage.
- `npm run lint` (oxlint) clean.

### Not yet measured

Draw-call counts and FPS were not instrumented with a diagnostics overlay in this pass (the spec's dev-only diagnostics adapter for property ID/world position/camera mode/quality tier/draw-call count) — this is the primary open item before the feature can be declared fully complete against the spec's "Measurable acceptance criteria". See `docs/handoff/known-limitations.md`.
