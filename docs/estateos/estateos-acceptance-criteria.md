# ESTATE / OS Acceptance Criteria

## Product

- Core demonstration path works from login through Digital Twin selection to related records.
- Every dashboard metric drills into a matching filtered dataset.
- Properties, tenants, contracts, payments, and maintenance implement the approved MVP only.
- Permissions are enforced server-side and reflected in the UI.

## UI and states

- Every feature maps to an approved Figma frame and design-system component.
- Default, Loading, Empty, Error, and Validation states exist where applicable.
- Desktop, approved tablet/mobile frames, and non-core responsive rules are implemented.
- English and Traditional Chinese are usable.
- No unapproved palette, font, generic dashboard template, or detached visual language.

## Three.js

- Every visible building maps to a real `propertyId`.
- Hover, select, district selection, filters, search focus, reset, and detail navigation work.
- Selection panel, property route, and building state use the same data.
- Mutations synchronize the scene and operational UI.
- Camera remains bounded and never moves on hover.
- Reduced Motion and WebGL fallback work.
- Geometry, materials, textures, and render targets are disposed.
- Navigation does not create multiple render loops.
- The final scene preserves the approved concept's composition and avoids a generic cube/neon demo.

## Accessibility

- Target WCAG 2.2 AA
- Keyboard navigation and visible focus
- Form label/error association
- Dialog focus management
- Minimum touch targets
- Contrast validation
- Reduced Motion
- Screen-reader alternative for 3D and charts

## Testing

Frontend: Vitest, React Testing Library, and Playwright for authentication, CRUD, URL filters, validation, permissions, state coverage, and localization.

Backend: xUnit and API/integration coverage for archive, contract conflicts/dates, payment and maintenance invariants, permissions, filtering, pagination, sorting, and Problem Details.

## Definition of Done

- Tests pass
- No serious console error
- No unexplained spec deviation
- API, validation, and permission behavior are complete
- Responsive and localization QA pass
- README, architecture, database, API, design, testing, and limitations documentation are updated
- Demo screenshots/video can be produced from stable flows

