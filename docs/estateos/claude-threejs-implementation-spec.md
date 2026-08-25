# ESTATE / OS Digital Twin — Claude Code Implementation Specification

## Assignment and authority

Claude Code must implement the interactive Estate Digital Twin described here inside the existing React application. This document is an engineering contract, not an invitation to redesign.

Before implementation, inspect:

- Approved visual reference: `docs/design/assets/estateos-digital-twin-concept-v1.png`
- Figma file: `ESTATE / OS — Product Design`, especially `02 Core Screens` nodes `21:3`, `21:4`, and `21:6`
- Design tokens: `docs/estateos/estateos-design-system.md`
- Product rules: `docs/estateos/estateos-product-spec.md`
- Existing high-level motion intent: `docs/estateos/estateos-threejs-motion-spec.md`

If code, Figma, and this document conflict, preserve the product/data rules, then this document's interaction behavior, then match the approved visual reference. Record any material ambiguity in `docs/handoff/questions-for-codex.md`; do not silently improvise.

## Required outcome

Build a dark, oblique architectural asset city in which every rendered building maps to one real `Property` entity. The scene must support portfolio overview, district focus, property hover, property selection, search-to-focus, filtering, visualization modes, keyboard navigation, and detail-page navigation.

The target feeling is an architectural intelligence instrument: calm, precise, spatial, and operational. It is not a game, cyberpunk city, generic 3D hero, or decorative particle background.

## Non-goals

- No real GIS, map tiles, geographic accuracy, physics, pedestrians, vehicles, weather, or day/night cycle.
- No fabricated units, floors, occupancy, or building features.
- No continuous idle camera orbit or uncontrolled animation.
- No purple/blue neon, excessive bloom, floating logos, star fields, or decorative particles.
- No separate hard-coded Three.js property dataset.
- No mandatory GLTF asset. Start with procedural architecture; add reusable GLTF modules only if they measurably improve the approved appearance without weakening performance.

## Existing dependency contract

The repository already includes `three`, `@react-three/fiber`, and `@react-three/drei`. Do not change their versions solely for this feature. Add a post-processing dependency only if the chosen outline implementation cannot be achieved cleanly with the installed stack; document any added package and bundle impact.

## Recommended source structure

```text
frontend/src/features/digital-twin/
  api/
    digitalTwinQuery.ts
  components/
    DigitalTwinCanvas.tsx
    DigitalTwinScene.tsx
    CityGround.tsx
    DistrictGroup.tsx
    PropertyBuilding.tsx
    PropertyHitTarget.tsx
    SelectionRing.tsx
    PropertyLabel.tsx
    SpatialLegend.tsx
    SpatialToolbar.tsx
    DigitalTwinFallback.tsx
    DigitalTwinErrorBoundary.tsx
  geometry/
    buildingArchetypes.ts
    cityLayout.ts
    facadeGeometry.ts
  materials/
    buildingMaterials.ts
    statusAppearance.ts
  motion/
    assemblyTimeline.ts
    cameraTransitions.ts
    useBuildingMotion.ts
  state/
    digitalTwinStore.ts
    digitalTwinSelectors.ts
  types/
    digitalTwin.ts
  utils/
    seededRandom.ts
    qualityTier.ts
    spatialNavigation.ts
  tests/
    cityLayout.test.ts
    statusAppearance.test.ts
    digitalTwinStore.test.ts
    DigitalTwinCanvas.test.tsx
```

Names may adapt to existing conventions, but preserve these responsibility boundaries. Do not place the entire feature in one component.

## Data contract

Use the existing property API response as the only business source. Adapt it once at the query boundary:

```ts
type PropertyType = 'Apartment' | 'Studio' | 'Townhouse' | 'Office' | 'Retail'
type PropertyStatus = 'Occupied' | 'Vacant' | 'Maintenance' | 'Archived'
type ContractSignal = 'None' | 'Active' | 'ExpiringSoon'

interface DigitalTwinProperty {
  id: string
  code: string
  name: string
  city: string
  district: string
  type: PropertyType
  status: PropertyStatus
  size: number | null
  monthlyRent: number | null
  contractSignal: ContractSignal
  occupancyPercent: number | null
  monthlyRevenue: number | null
  maintenanceOpenCount: number
}
```

If the API does not supply an aggregate field, render `null`/unavailable in the DOM label instead of inventing it. Archived properties are excluded by default. The property `id` must be the stable key used by table rows, URL state, Zustand selection, canvas object metadata, and navigation.

## Coordinate system and deterministic layout

- World axes: `X` east/west, `Y` vertical, `Z` north/south.
- Ground plane: `Y = 0`, approximately `64 × 48` world units.
- City center: `(0, 0, 0)`.
- One world unit represents a visual planning unit, not a physical meter.
- The same input property set must always produce the same positions across sessions and filters.

### Stable seed

Implement a small deterministic hash from `property.id` and `district`, followed by a seeded PRNG. Never use `Math.random()` for layout. Sorting or filtering must not reposition existing properties.

### District placement

1. Sort normalized district keys alphabetically.
2. Assign districts to a fixed spiral/grid of anchors beginning at the center:

```ts
const DISTRICT_ANCHORS: Array<[number, number]> = [
  [0, 0], [-15, -9], [15, -9], [-16, 10], [16, 10],
  [0, 17], [-29, 0], [29, 0], [0, -20]
]
```

3. If there are more districts, continue a deterministic rectangular spiral at 14-unit spacing.
4. Inside a district, place properties on a local 4-unit grid with seeded jitter capped at `±0.35` units.
5. Maintain at least `0.9` units between final building footprints. Resolve collisions deterministically by moving to the next local grid slot.
6. Roads/negative space are composition gaps only; they must not imply real geography.

Expose layout as a pure function and snapshot-test the output.

## Building mass and archetypes

All buildings use a centered group whose origin is the footprint center on `Y = 0`. Set `group.userData.propertyId`.

Normalize valid property sizes within the current unfiltered portfolio using winsorized 10th/90th percentile values:

```ts
sizeT = clamp((size - p10) / max(p90 - p10, 1), 0, 1)
rentT = clamp((monthlyRent - rentP10) / max(rentP90 - rentP10, 1), 0, 1)
```

When data is missing, use archetype median dimensions and do not communicate a false numeric meaning.

| Type | Base footprint X×Z | Height formula | Architectural cue |
|---|---:|---:|---|
| Apartment | `2.8 × 2.5` | `5.5 + sizeT × 8.5` | stepped tower with inset roof mass |
| Studio | `2.2 × 2.0` | `3.8 + sizeT × 5.0` | compact monolith, fine vertical reveal |
| Townhouse | `3.2 × 2.4` | `2.8 + sizeT × 2.4` | two offset volumes, lower silhouette |
| Office | `3.6 × 3.2` | `6.5 + sizeT × 10.5` | strong curtain-grid facade, crown band |
| Retail | `4.2 × 3.0` | `2.4 + sizeT × 2.8` | broad podium, recessed entry strip |

Footprint scale may vary from `0.88` to `1.18` using `sizeT`. `rentT` may influence the density of facade signal lines by at most 20%; it must not alter building height. Rooms and `floor` may appear in the HTML detail label but must not be translated into fictional visible floors.

Prefer beveled box geometry with small bevel (`0.04–0.08`) where quality permits. Reuse geometries and materials by archetype/status. Repeated window/reveal elements must use `InstancedMesh` or merged geometry, not hundreds of independent meshes.

## Scene appearance

### Palette

Use only approved tokens:

| Role | Color | Implementation intent |
|---|---|---|
| World background | `#0A0F0D` | renderer clear color and fog base |
| Occupied mass | `#275B43` | stable asset material |
| Spatial selection | `#B7F34A` | outline/ring/data signal on dark only |
| Vacant mass | `#4B514D` | muted, low-emission material |
| Maintenance | `#D69A35` | restrained warning pulse |
| Critical/error only | `#BE5A4E` | never decorative |
| Grid/secondary lines | `#737B75` | low opacity |
| Warm UI panel | `#F1F0E9` | DOM overlay, not 3D building material |

### Materials

Default buildings use `MeshStandardMaterial`:

- occupied: roughness `0.78`, metalness `0.08`, emissive `#275B43`, emissiveIntensity `0.10`
- vacant: roughness `0.88`, metalness `0.02`, emissive `#0A0F0D`, emissiveIntensity `0.04`, opacity `0.72`
- maintenance: roughness `0.76`, metalness `0.06`, emissive `#D69A35`, emissiveIntensity animated `0.14–0.30`
- selected override: preserve base surface; add outline/ring instead of recoloring the whole building lime

Use tone mapping consistently and set renderer output color space correctly for the installed Three.js version. Do not add bloom by default. If a subtle selective glow is retained after profiling, it must not bleed farther than roughly 3 screen pixels at 1440px width.

### Ground and grid

- Ground: matte plane `#0D1511`, roughness `1`, receives soft shadow where enabled.
- Primary grid: spacing `4`, opacity `0.14`.
- Secondary district grid/contours: opacity `0.05–0.08`.
- Selected-property locator: two concentric rings at `Y = 0.035`; radius equals footprint diagonal × `0.72` and `0.90`.
- Never use an infinite bright helper grid.

### Lighting and fog

- Ambient/hemisphere contribution: cool-neutral, intensity near `0.65`.
- Key directional light: position `(-18, 26, 12)`, intensity near `2.2`, soft shadow only on High tier.
- Rim directional light: position `(18, 12, -16)`, approved green-gray, intensity near `0.55`.
- No point light per building.
- Exponential fog color `#0A0F0D`, density starting near `0.018`; tune only within `0.014–0.024` to keep foreground readable.

The exact intensity can be calibrated for the renderer's tone mapping, but color roles and restrained contrast cannot change.

## Canvas and camera

Use a perspective camera:

```ts
fov: 36
near: 0.1
far: 180
initialPosition: [28, 25, 34]
initialTarget: [0, 2.2, 0]
```

Controls:

- polar angle: `0.52–1.20` radians
- azimuth: limited to approximately `±0.95` radians from the default bearing
- distance: `12–62`
- truck/pan boundary: X `[-32, 32]`, Z `[-25, 25]`
- damping enabled; no auto-rotate
- prevent camera from crossing ground or clipping through the selected building
- pointer hover never moves the camera

Canvas configuration:

- opaque canvas over `#0A0F0D`
- High DPR `[1, 1.75]`; Medium `[1, 1.4]`; Low `[1, 1.15]`
- `powerPreference: 'high-performance'`
- antialias on High/Medium, optional off on Low after visual review
- render on demand where practical; invalidate during interactions and animations

## Camera state machine

Use explicit states, not scattered booleans:

```ts
type CameraMode =
  | { kind: 'portfolio' }
  | { kind: 'district'; district: string }
  | { kind: 'property'; propertyId: string }
  | { kind: 'manual'; returnTo: Exclude<CameraMode, {kind: 'manual'}> }
```

### Portfolio

Position near `[28, 25, 34]`, target `[0, 2.2, 0]`. Reset returns here and clears district/property selection only when the user invokes reset.

### District focus

Compute the district bounds. Target its center at 30% of its maximum height. Camera distance is `clamp(boundsRadius × 2.7, 18, 34)`. Transition duration `0.85s`, cubic ease-in-out, using a shallow curved/interpolated path. Other districts dim to opacity `0.28`; positions never change.

### Property focus

Target `(buildingX, buildingHeight × 0.42, buildingZ)`. Desired distance is `clamp(buildingHeight × 1.45, 9.5, 18)`. Preserve an oblique direction similar to the current camera rather than snapping to a fixed front. Transition duration `0.72s`. Selection panel begins entering at 55% of the camera transition and completes no later than the camera.

### Manual interruption

Any pointer/touch control start cancels the active scripted transition immediately and enters `manual`. Do not fight user input. A later explicit selection may start a new transition. `Escape` returns one semantic level: property → district/portfolio; district → portfolio.

### Reduced motion

When `prefers-reduced-motion: reduce` or the application preference is enabled:

- set camera/target immediately or crossfade the DOM panel in `≤120ms`
- do not animate building emergence, scan lines, pulse, or ring rotation
- use a static 2px selection outline and fixed amber maintenance marker

## Interaction contract

### Raycast and pointer

- Use R3F pointer events/Three.js raycasting only on property hit targets, not every facade detail.
- Each hit target must resolve to exactly one `propertyId`.
- `pointerover`: set hover ID and show label after `80ms`; no camera motion.
- `pointerout`: clear only if the pointer is not entering another child of the same property group.
- primary click/tap: select property and start property focus.
- second click on the selected building or explicit `Open property` button: navigate to `/properties/{id}`.
- click empty ground: clear hover; do not clear a locked selection unless the product UI explicitly offers this action.
- set cursor to pointer only over an actionable building.

For touch, the first tap selects and reveals the panel; the panel button opens detail. Do not rely on hover.

### Keyboard and DOM mirror

Provide a visually integrated DOM asset list/combobox that mirrors the visible filtered properties:

- Arrow keys move through the deterministic spatial order.
- Enter selects; a second Enter/open button navigates.
- Escape moves up one level.
- `R` resets camera only when focus is not inside an input.
- Every property exposes name, status, district, and available KPI text to assistive technology.
- Canvas itself is not the sole means of accessing any property.

### Label behavior

Use an HTML overlay anchored above the building:

```text
BUILDING 07
桃園八德
Occupancy 92%
Monthly Revenue NT$158,000
```

Only show fields supplied by the API. Clamp the overlay to the canvas viewport and prevent overlap with the right-side selection panel. At most one hover label and one locked selection panel may be visible.

## Application-state ownership

TanStack Query owns property/aggregate data. Zustand owns only spatial UI state:

```ts
interface DigitalTwinViewState {
  hoveredPropertyId: string | null
  selectedPropertyId: string | null
  focusedDistrict: string | null
  visualizationMode: 'occupancy' | 'revenue' | 'contract' | 'maintenance'
  statusFilter: PropertyStatus[]
  typeFilter: PropertyType[]
  quality: 'auto' | 'high' | 'medium' | 'low'
  assemblySeen: boolean
}
```

Durable filters/mode belong in URL search params. Store only IDs, never copied `Property` objects. API mutations invalidate the property list/detail/dashboard queries; the scene then derives the updated appearance from the refreshed query.

## Visualization modes

Changing mode must not relocate buildings.

- `occupancy`: status material is primary; vacant is dim.
- `revenue`: map normalized revenue to emissive intensity `0.05–0.22` and show a textual legend; missing revenue uses neutral styling.
- `contract`: active is stable; expiring receives a paced outline; none is muted.
- `maintenance`: open count controls amber intensity in three labeled buckets (`1`, `2–3`, `4+`), not an unlabeled continuous color mystery.

Filters dim nonmatches to opacity `0.12` and disable their hit targets. Do not remove them from layout unless the user explicitly chooses “hide filtered”; stable spatial memory is mandatory.

## Motion choreography

### First resolved entry (2.55 seconds total)

Use one centralized timeline driven by elapsed time, not dozens of independent timeouts:

| Time | Event |
|---:|---|
| `0.00–0.25s` | background and ground resolve; no white flash |
| `0.18–0.55s` | primary grid draws from center at low contrast |
| `0.35–0.80s` | district anchor lines appear in deterministic order |
| `0.55–1.75s` | building masses rise from `scaleY 0.02` to `1`, staggered by district then property, max stagger `0.55s` |
| `1.20–2.05s` | facade/reveal lines resolve; never flicker randomly |
| `1.75–2.30s` | status emissions and labels activate |
| `2.10–2.55s` | toolbar/legend reports scene ready |

Geometry emergence easing: cubic-out. Opacity/signal easing: sine-out. Do not overshoot or bounce. On repeat visits in the same session, resolve in `0–0.45s`. If data arrives after the shell, keep the camera stable and assemble only newly added property IDs.

### Hover

- response begins within one rendered frame
- hovered surface brightness/emission increases by about 18%
- immediate neighbors within 6 world units dim by `12%`
- label enters in `120ms` with 4px upward translation
- no scaling beyond `1.01`, no bounce, no camera motion

### Selection

- ring expands from `0.82` to `1` in `260ms`
- outline becomes lime with edge strength equivalent around `2.2`, thickness around `1`, no pulse
- nonselected city opacity approaches `0.36` during camera focus
- facade lines transition toward architectural wireframe in `320ms`
- panel enters from right by `20px` plus opacity over `320ms`

### Maintenance and contract signals

- maintenance emissive breath: `2.4s` sine cycle between defined intensities; pause when tab is hidden
- expiring outline cue: `3.2s` cycle, never faster than `2s`
- selected styling always wins over maintenance/expiring styling; retain the status in the panel/legend

## Loading, empty, error, and unsupported states

- Loading: render the stable ground/grid shell and a DOM status `Loading asset model…`; do not show fake buildings.
- Empty: show resolved ground plus `No active properties match this view` and a clear-filter action.
- Partial data: render valid properties and list skipped records in development diagnostics; do not crash the full scene.
- API error: keep the application shell, show retry action and a non-3D error panel.
- WebGL unavailable/context lost: switch to `DigitalTwinFallback`, a 2D district/property list with the same filters and navigation.
- Context restoration may rebuild the scene once; repeated loss falls back for the session.

## Responsive behavior and quality tiers

### Desktop High (`≥1200px`, capable GPU)

- full scene, soft directional shadow, facade detail, selective outline
- DPR max `1.75`
- target 60 FPS; no sustained 10-second window below 45 FPS on a representative integrated-GPU laptop

### Tablet Medium (`768–1199px` or constrained GPU)

- same selection/filter/navigation capability
- reduced facade segments, no soft shadow or reduced shadow map, reduced post-processing
- DPR max `1.4`
- selection panel becomes a bottom/right sheet according to responsive specification

### Mobile Low (`<768px`)

- simplified solid archetype geometry, static grid, no post-processing or dynamic shadow
- DPR max `1.15`
- first tap selects; bottom sheet shows detail action
- aim for stable 30 FPS; automatically offer/use 2D fallback when capability checks fail

Auto tier may consider viewport, device pixel ratio, WebGL renderer capability, and measured frame time. Do not use user-agent sniffing as the primary decision. A manual quality override must remain available.

## Performance and lifecycle rules

- Target initial scene of 50–200 properties.
- High-tier steady state target: fewer than 180 draw calls; Medium fewer than 120; Low fewer than 80.
- Reuse archetype geometries/materials; instance repeated facade modules.
- Avoid React state updates inside `useFrame`; mutate refs for per-frame visual interpolation.
- Pause nonessential animation when `document.hidden`.
- Cap delta time after tab restoration to prevent jumps.
- Recompute instanced bounds after matrix changes when needed for correct culling/raycasting.
- Dispose geometries, materials, textures, render targets, controls, and post-processing passes on unmount/rebuild.
- Do not allocate vectors/colors/matrices in the hot frame loop; reuse scratch objects.
- Profile before adding BVH/LOD complexity. Add them only with recorded evidence in the implementation report.
- Record bundle-size change and representative performance measurements in `docs/handoff/implementation-report.md`.

## Accessibility

- Meet WCAG AA contrast in all DOM UI; lime is only text/outline on dark surfaces, never small text on warm surfaces.
- All filters, modes, reset, property selection, and detail navigation work without a pointer.
- Announce selection changes in a polite live region, e.g. `Building 07 selected, occupied, Taoyuan Bade`.
- Do not announce every hover or animation frame.
- Respect OS and in-app reduced-motion settings from first render; do not briefly play motion before detection.
- Provide a pause/disable spatial motion setting.

## Testing contract

### Unit

- seeded hash/PRNG produces stable output
- property positions remain unchanged when filters/modes change
- collision resolution respects minimum spacing
- size/rent normalization handles nulls and identical percentile values
- status/mode priority produces expected token/material values
- camera target/distance calculations stay within bounds
- quality-tier selection and reduced-motion behavior

### Component/integration

- loading, empty, error, fallback states
- hover/select state updates without copying property objects into Zustand
- filter disables hit targets and preserves positions
- URL mode/filter hydration
- Escape/back-level behavior
- keyboard list selection and detail navigation
- WebGL context-loss fallback

### Playwright

- select a known seeded property from the DOM mirror and verify panel content
- select the same building via canvas pointer coordinates using a deterministic fixture
- search-to-focus then open `/properties/{id}`
- change modes/filters and verify location stability via a development-only test hook
- reduced-motion run has no long camera/assembly animation
- mobile first tap selects and second explicit action opens detail

Do not use pixel-perfect snapshots as the only 3D test. Add a small development-only diagnostics adapter exposing property ID, world position, camera mode, quality tier, and draw-call count; remove it from production builds through the Vite development branch.

## Measurable acceptance criteria

The feature is complete only when all items pass:

- Every visible building maps to one API property ID; no duplicate or orphan IDs.
- Layout is deterministic across reload, filtering, sorting, and visualization mode changes.
- Hover response begins within 100ms under target conditions and never moves the camera.
- Selection visibly links building, label, panel, URL state, and property detail navigation.
- Camera respects all bounds and user interruption.
- First-entry motion completes in `2.2–2.8s`; repeat entry is `≤0.45s`; reduced motion resolves immediately/`≤0.12s`.
- Loading, empty, API error, WebGL unavailable, and context-loss states are usable.
- Desktop/tablet/mobile quality tiers preserve the core selection flow.
- No sustained desktop High performance below 45 FPS in the recorded 10-second representative run; mobile Low targets stable 30 FPS or activates fallback.
- Draw calls stay within the tier budgets unless a measured, documented exception is approved.
- Keyboard and DOM mirror can reach every filtered property and open its detail page.
- No unapproved color, fabricated metric, decorative particle system, auto-orbit, or uncontrolled bloom appears.
- Unit, integration, and Playwright tests for this contract pass.

## Claude Code delivery checklist

Before declaring completion, Claude Code must provide:

```text
docs/handoff/implementation-report.md
docs/handoff/test-report.md
docs/handoff/known-limitations.md
docs/handoff/spec-deviations.md
```

The implementation report must include dependency changes, file map, state/data flow, scene-object counts, draw calls, FPS test device/context, fallback behavior, accessibility verification, and screenshots/video matching the approved reference.

## Official implementation references

- Three.js Raycaster: https://threejs.org/docs/pages/Raycaster.html
- Three.js InstancedMesh: https://threejs.org/docs/pages/InstancedMesh.html
- Three.js OutlinePass: https://threejs.org/docs/pages/OutlinePass.html
- Three.js picking manual: https://threejs.org/manual/en/picking.html

Use these APIs according to the installed Three.js version and TypeScript definitions. Do not copy an official example wholesale; apply the techniques to EstateOS's data and interaction contract.
