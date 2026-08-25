# ESTATE / OS Three.js and Motion Specification

## Approved concept

**Estate Digital Twin — Interactive Asset City** is a concrete, data-driven city with three levels: Portfolio View, District View, and Property Focus View.

Visual reference: [estateos-digital-twin-concept-v1.png](../design/assets/estateos-digital-twin-concept-v1.png).

## Scene construction

- Oblique aerial camera with clear foreground, middle ground, and background
- Abstract Taiwan asset districts; not real GIS
- Procedural massing plus reusable architectural modules
- Apartment, Studio, Townhouse, Office, and Retail archetypes
- Property size influences normalized building mass
- Matte architectural materials with restrained glass/grid office facades
- Ground grid, district labels, controlled fog, directional light, and scarce accent light

No property receives fabricated floor/unit detail. Visual variation is derived only from available type, size, status, and district data.

## Assembly sequence

```text
Ground grid initializes
→ district coordinates illuminate
→ foundations emerge
→ structures assemble vertically
→ facade lines resolve
→ property states activate
→ operational UI synchronizes
```

Target duration: 2.2–2.8 seconds on first entry. Repeat visits shorten or skip it. Reduced motion renders the resolved state directly.

## Portfolio View

Shows the whole asset city with Occupancy, Revenue, Contract Expiry, and Maintenance modes. Filters dim nonmatching properties without moving building positions.

## District View

Selecting a district dims others, approaches with a curved camera path, slightly separates buildings for legibility, and opens district KPIs. Spatial memory must remain stable.

## Property Focus View

### Hover

Raycast identifies the property. The building brightens, neighbors dim 10–15%, and a constrained data label appears. Camera does not move.

### Select

```text
Lock selection
→ expand selection ring
→ camera approach
→ dim neighbors
→ facade becomes architectural wireframe
→ data spine appears
→ property preview panel enters
```

### Open detail

The building separates into three semantic layers—Structure, Contract, Operations—then reconnects into the Property Detail header. These are information categories, not fictional physical floors.

## Controls

- Bounded orbit, pan, and zoom
- Hover and select property
- Select district
- Filter type and status
- Change visualization mode
- Search and camera focus
- Reset camera
- Open property detail
- Escape to previous level
- Keyboard asset navigation
- Reduced Motion and Performance Quality settings

Camera must not cross the ground, rotate without bounds, move on hover, or take control after manual input.

## Data state mapping

- Occupied: stable Asset Green
- Vacant: desaturated low-light gray
- Maintenance: restrained amber signal
- Expiring: paced outline cue
- Selected: Spatial Signal outline and selection ring
- Archived: excluded from default scene

UI label, legend, and DOM alternative duplicate all critical meanings.

## Technical approach

- React Three Fiber and Drei
- Three.js Raycaster / R3F pointer events
- CameraControls
- EffectComposer and selective OutlinePass
- Independent building groups for precise selection
- InstancedMesh for repeated windows, lights, and facade parts
- GLTF only for reusable architectural modules
- LOD or simplified geometry by distance when profiling justifies it
- Explicit disposal of geometry, material, textures, and render targets

Official technique references:

- Three.js interactive raycasting examples
- Three.js InstancedMesh example
- Three.js OutlinePass documentation and example
- Three.js keyframe animation example
- Three.js batched LOD/BVH example

## Synchronization

Property mutations invalidate list, detail, dashboard, and scene queries. The same property ID drives the table row, detail page, preview panel, and building material. There is no parallel hard-coded 3D dataset.

## Quality tiers

### Desktop High

Full city, selective outline, controlled post-processing, capped DPR, target 60 FPS and no sustained operation below 45 FPS on a representative general-purpose laptop.

### Tablet Medium

Reduced DPR, shadows, geometry detail, and post-processing; selection and navigation remain intact.

### Mobile Low

Simplified geometry and no expensive effects. Weak devices or unsupported WebGL use a 2D spatial/list fallback.

## Motion prohibitions

No decorative particles, perpetual floating, universal fade-up, excessive bloom, cyberpunk blue/purple neon, camera movement on hover, or unskippable sequence.

## Accessibility

- DOM asset list mirrors the canvas
- Keyboard selection and detail opening
- Screen-reader summary of active filters and selected property
- Reduced motion replaces camera fly, scan, pulse, and geometry reveal
- Fixed outline substitutes for pulse

