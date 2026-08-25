# ESTATE / OS Design System

## Design Read

```yaml
artifact: full-stack property dashboard and spatial prototype
audience: engineering interviewers and internal property staff
visual-language: institutional data-first + architectural editorial + controlled spatial experimentation
mode: greenfield
visual-variance: 6/10
motion-intensity: 7/10 spatial; 3/10 operational
information-density: 7/10
asset-dependence: 3/10
brand-fidelity: 4/10
```

High variance is concentrated in the spatial layer. Navigation, forms, and tables keep a stable grid. High motion applies to navigation causality and spatial state, not every element.

## Two visual registers

### Observation / Spatial

Dark, cinematic, authoritative. Used for authentication transition, Executive Overview, and Digital Twin City.

### Operational

Warm gray, restrained, high-readability. Used for properties, tenants, contracts, payments, maintenance, reports, and settings.

## Tokens

### Colors

| Token | Value | Use |
|---|---|---|
| Observation Dark | `#0A0F0D` | Spatial background |
| Warm Workspace | `#F1F0E9` | Operational background |
| Primary Ink | `#17201C` | Main text |
| Asset Green | `#275B43` | Occupied / brand |
| Spatial Signal | `#B7F34A` | Selection, live state, primary spatial action |
| Muted Gray | `#737B75` | Secondary content |
| Divider | `#C9CDC7` | Hairlines |
| Warning | `#D69A35` | Maintenance / warning |
| Critical | `#BE5A4E` | Destructive / error |

Spatial Signal is scarce. It must not become the default color of every button or card.

### Typography

- UI and display: Instrument Sans
- Technical labels and data IDs: IBM Plex Mono
- Traditional Chinese: Noto Sans TC
- Numeric tables use tabular numerals
- Mono is limited to codes, coordinates, statuses, and technical labels

### Spacing and grids

- Base unit: 4 px
- Core rhythm: 8, 12, 16, 24, 32, 48, 64
- Desktop: 12 columns
- Tablet: 8 columns
- Mobile: 4 columns

### Radius

- 2 px: data cells and compact controls
- 6 px: inputs, buttons, panels
- 12 px: modal and spatial viewport
- Pill: only status chips and avatars

### Elevation

Hierarchy primarily uses typography, spacing, and hairlines. Shadows are reserved for modal, popover, drawer, and floating controls. Avoid generic glass cards.

## Motion tokens

| Category | Duration |
|---|---:|
| Micro feedback | 120–180 ms |
| Panel transition | 220–320 ms |
| Data morph | 400–600 ms |
| Camera approach | 800–1200 ms |
| Major spatial transition | 1400–1800 ms |

- Operational easing: `cubic-bezier(.2,.8,.2,1)`
- Spatial easing: `cubic-bezier(.16,1,.3,1)`
- Reduced motion replaces camera movement with a 150–200 ms crossfade

## Status semantics

- Occupied: stable Asset Green
- Vacant: low-luminance neutral gray
- Maintenance: restrained amber pulse or fixed outline
- Expiring contract: paced outline cue
- Selected: Spatial Signal outline and selection ring

Every state also has text or shape encoding; color alone is insufficient.

## Figma requirements

- Variables for color, spacing, radius, typography, and modes
- Auto Layout, grids, constraints, and component variants
- No detached instances in final frames
- Developer annotations for scroll, sticky, responsive, localization, and motion behavior
- Every component maps to a named React component and token set

