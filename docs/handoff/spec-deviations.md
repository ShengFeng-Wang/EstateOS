# Spec Deviations

Claude Code records places where the shipped implementation intentionally differs from the literal Figma/spec data, with rationale. Not for open decisions — those go in `docs/handoff/questions-for-codex.md`.

## 2026-08-25 — AppSidebar default nav-item text color

**Spec:** Figma node `#I37:117;22:15;16:74` (and the other default-state nav items inside the `AppSidebar` instance, frame `#33:2`) sets nav label text fill to `#17201C` (Primary Ink) on the sidebar's `#0A0F0D` (Observation Dark) background — a contrast ratio near 1:1, effectively invisible. The `SidebarItem` component's `State=Default` variant appears to have been authored against the light demo background on the "01 Components" page and never given a dark-surface override before being instantiated in the dark sidebar.

**Deviation:** Implemented default (inactive) nav item text as `rgb(241 240 233 / 70%)` (Warm Workspace at reduced opacity) instead of the literal `#17201C`, with full opacity on hover. The Active state's text color (`#F1F0E9` on Asset Green) was implemented as-authored — that one has correct contrast.

**Why:** This isn't a product/visual decision — invisible navigation labels are a legibility defect, not an approved design choice. Codex's own `estateos-design-system.md` update earlier the same day added a `Warm Accent Text` token specifically to fix an analogous contrast problem (Spatial Signal green on light text), showing this class of fix is within Claude Code's remit to catch and correct without escalating.

## 2026-08-26 — Properties Detail built without live Figma node data

**Spec:** `estateos-screen-inventory.md` describes Property Detail as tabbed frames (Overview, Tenant, Contract, Payments, Maintenance) with Occupied/Vacant/Maintenance detail states, but the Figma MCP connection used for the pixel-precise Login/Sidebar/Properties-List passes was not available this session (the MCP server process was not running and could not be reconnected without a full environment restart).

**Deviation:** `/properties/:id` (`PropertyDetailPage.tsx`) was built from the written `estateos-component-spec.md` (Tabs, DataTable, DefinitionList/KeyValuePair, StatusBadge, Modal/ConfirmationDialog families) and the already-established design tokens (`tokens.css`) and component patterns from the List/Sidebar work, rather than diffed against literal Figma frame node positions/colors. Layout follows the same visual language (spacing rhythm, type scale, table/row treatment) as the pixel-matched screens, but has not been verified against exact Figma coordinates.

**Why:** Continuing engineering work per the brief's delivery order should not block on MCP availability. Recommend a follow-up pixel-audit pass over this screen (and any others built this way) once the Figma MCP connection is confirmed working again.

## 2026-08-26 — Login's flat decorative graphic replaced with a non-interactive Three.js scene

**Spec:** The approved Login frame (`#28:25`) renders the "Spatial Identity" graphic as 15 flat CSS rectangles (`SpatialBars.tsx`), positioned per literal Figma node data.

**Change:** Requested directly by the product owner (not a Codex/Figma revision): the same 15-block composition — same positions, same relative sizes, same single Spatial Signal accent block — is now extruded into an ambient, non-interactive 3D skyline (`LoginSpatialCity.tsx`) using React Three Fiber, on the same dark Observation surface. It auto-rotates slowly (no user control, no raycasting, no data binding — this is decorative, unlike the Digital Twin, which renders real property records), plays a one-time staggered rise-in on mount, and freezes at a fixed angle under `prefers-reduced-motion`. The original flat `SpatialBars` component is kept as the render path for WebGL-unsupported browsers and the brief moment before the lazy-loaded 3D chunk arrives. The graphic still only renders above the same 1200px breakpoint as before.

**Why:** This is an explicit, direct product request, not a unilateral engineering decision to add decorative Three.js — the implementation brief's prohibition on "reducing Three.js to decorative background animation" is about not degrading the *required interactive* Digital Twin, not a ban on any decorative 3D use elsewhere. No new colors were introduced (same palette tokens as the Digital Twin); the exact approved 2D composition was extruded rather than redesigned.

## 2026-08-27 — Digital Twin replaced with a real Google Photorealistic 3D Tiles map

**Spec:** `estateos-threejs-motion-spec.md`'s "Approved concept" states the Digital Twin is "Abstract Taiwan asset districts; not real GIS" — a deliberately fictional procedural city, not real-world geography.

**Change:** Requested directly by the product owner: `/digital-twin` (the same nav entry and route) now renders real Google Photorealistic 3D Tiles — actual satellite/aerial photogrammetry of Taipei/New Taipei/Taoyuan, navigated with the `3d-tiles-renderer` library's `GlobeControls` (drag/scroll/tilt, Google-Earth-style). Property markers are placed at each property's real district centroid (a small fixed lookup table of actual lat/lng for the 9 districts in the seed data) plus a small deterministic jitter — **not** geocoded from the fictional street address, since that address isn't real (see the localization spec's demo-content rules). Marker click navigates to the property detail page, same as the old Digital Twin's building click.

The previous fictional-city implementation (`frontend/src/features/digital-twin/`, its Vitest suite, and the 517-line `claude-threejs-implementation-spec.md` it was built against) is **left in place, not deleted** — it's simply unrouted. This is a deliberate rollback safety net: the new implementation depends on an external, billed Google Cloud API the user just provisioned, which the team hasn't yet load-tested or budget-tested over time. If that dependency becomes a problem, reverting `router.tsx`'s `/digital-twin` entry restores the old feature immediately, no rebuild required.

**Why:** Explicit, direct product request overriding the approved spec's "not real GIS" concept — the user asked specifically for real geography, a bigger/more comfortable viewport (the route's layout is now full-bleed, no sidebar-content padding — see `AppLayout.tsx`'s `FULL_BLEED_ROUTES`), and easier navigation, all of which a real map product naturally provides. Verified live against Google's servers (300+ successful tile requests, zero errors) before being wired into the main route.

## 2026-08-27 — Real Map scoped to a single zone (Bade) with click-to-inspect restored

**Spec:** The Real Map as first shipped (same day, entry above) showed the whole portfolio across all 9 seeded districts, with markers that navigated straight to the property detail page on click.

**Change:** Immediately narrowed to a single explicit request: only Bade (八德重劃區) properties render, the camera is geographically leashed to that zone (see known-limitations.md), and clicking a building now opens an in-scene selection panel (price, status, type, address, an "Open property" link) instead of navigating away immediately — restoring the old fictional Digital Twin's click-to-inspect UX on top of the real tiles, since Google's Photorealistic 3D Tiles have no per-building semantic hit-testing of their own (each property gets a footprint-sized invisible proxy hit target instead).

**Why:** Direct, explicit follow-up request — "只要有八德重劃區 其他地方就不需要出現" (only Bade Redevelopment Zone needs to be there; nowhere else needs to appear) and a request to bring back building-level interactivity with price info, matching the old Digital Twin's selection experience.
