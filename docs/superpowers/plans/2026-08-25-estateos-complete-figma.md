# EstateOS Complete Figma Product Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a complete EstateOS Figma product design containing 85 desktop frames, 16 tablet frames, 24 mobile frames, and the supporting design-system, motion, localization, prototype, and developer-handoff boards.

**Architecture:** Use the approved EstateOS variables, text styles, effects, and component instances as the single design source. Organize product frames by module page, build wrappers before sections, and verify every batch with screenshots plus programmatic checks for size, font, overflow, placeholder text, and component reuse.

**Tech Stack:** Figma Design, Figma Variables, Figma Components and Variants, Figma Prototype annotations, React/Three.js engineering handoff specifications.

**Spec:** `docs/estateos/estateos-screen-inventory.md`

## Global Constraints

- Desktop frames are 1440 × 1024 unless a documented flow requires additional vertical height.
- All 85 desktop frames must be produced; states are not represented by text-only notes.
- All core-flow tablet and mobile frames must be produced: 16 tablet and 24 mobile.
- Product fonts are Instrument Sans, IBM Plex Mono, and Noto Sans TC only.
- Components use EstateOS variables and text styles; reusable UI is placed as component instances.
- Three.js visuals must map buildings to Property entities and include non-WebGL and reduced-motion alternatives.
- Frame names use `[Platform] / [Module] / [Screen] / [State] / [Locale]`.
- Every batch ends with screenshot review and programmatic font, size, overflow, and instance checks.

---

### Task 1: Expand the Figma file into module pages

**Files:**
- Modify: `.figma/estateos-design-state.json`
- Reference: `docs/estateos/estateos-screen-inventory.md`

**Interfaces:**
- Consumes: Existing Foundations, Components, and Core Screens pages.
- Produces: Stable module page IDs recorded in the state ledger.

- [ ] Create Patterns, Prototype Flows, Authentication, Executive Overview, Properties, Tenants, Contracts, Payments, Maintenance, Reports, Settings, System States, Responsive, Motion & 3D, Localization, Developer Handoff, and Archive pages.
- [ ] Return and record every new page ID.
- [ ] Verify the page list with Figma metadata.

### Task 2: Complete Authentication — 6 desktop frames

**Interfaces:**
- Consumes: TextInput, Button, EstateOS color and typography tokens.
- Produces: Login Default, Login Validation Error, Login Authentication Error, Forgot Password Default, Forgot Password Email Sent, Session Expired.

- [ ] Create six 1440 × 1024 wrappers on the Authentication page.
- [ ] Assemble every state with component instances and state-specific copy.
- [ ] Screenshot all six frames and verify fonts, overflow, and placeholder removal.

### Task 3: Complete Executive Overview — 9 desktop frames

**Interfaces:**
- Consumes: AppSidebar, MetricDisplay, StatusBadge, PropertyMapTooltip, PropertySelectionPanel.
- Produces: Dashboard Default, Loading, Empty Portfolio, Partial Data Error, Date Range Changed; Spatial Map Default, Building Hovered, Building Selected, Filtered.

- [ ] Create nine wrappers on the Executive Overview page.
- [ ] Build dashboard data states using shared components and skeleton/empty/error patterns.
- [ ] Build four spatial-map interaction states with Property-linked visual meaning.
- [ ] Screenshot and verify the nine-frame batch.

### Task 4: Complete Properties — 14 desktop frames

**Interfaces:**
- Consumes: AppSidebar, SearchField, Button, DataTable/Header, DataTable/Row, StatusBadge, form fields.
- Produces: List Default, Loading, Empty, Search Results, No Results, Filtered, Row Selected, Bulk Selection; Detail Occupied, Vacant, Maintenance; Create Default, Create Validation Error, Edit with Archive Confirmation.

- [ ] Create fourteen wrappers on the Properties page.
- [ ] Assemble eight list states with consistent table columns and controls.
- [ ] Assemble three property-detail entity states and their related-record sections.
- [ ] Assemble create, validation, edit, and archive-confirmation flows.
- [ ] Screenshot and verify all fourteen frames.

### Task 5: Complete Tenants — 9 desktop frames

**Interfaces:**
- Consumes: SearchField, DataTable patterns, StatusBadge, form components.
- Produces: List Default, Loading, Empty, Search Results, Filtered; Detail Active Lease, Detail No Active Lease; Create Default; Edit Validation Error.

- [ ] Create and assemble all nine tenant frames.
- [ ] Verify active/no-active lease data differences are visible and meaningful.
- [ ] Screenshot and validate the batch.

### Task 6: Complete Contracts — 10 desktop frames

**Interfaces:**
- Consumes: Table, status, date, form, dialog, and related-record patterns.
- Produces: List Default, Loading, Empty, Filtered; Detail Active, Expiring Soon, Expired; Create Default, Create Validation Error; Edit with Terminate Confirmation.

- [ ] Create and assemble all ten contract frames.
- [ ] Represent expiry and termination through text plus status color.
- [ ] Screenshot and validate the batch.

### Task 7: Complete Payments — 9 desktop frames

**Interfaces:**
- Consumes: Table, status, amount/date, form, and detail patterns.
- Produces: List Default, Loading, Empty, Filtered, Overdue; Detail Paid, Pending, Overdue; Record Payment Validation Error.

- [ ] Create and assemble all nine payment frames without implying a real payment gateway.
- [ ] Verify Paid, Pending, and Overdue remain distinguishable without color.
- [ ] Screenshot and validate the batch.

### Task 8: Complete Maintenance — 10 desktop frames

**Interfaces:**
- Consumes: Table, priority/status, form, activity, and confirmation patterns.
- Produces: List Default, Loading, Empty, Filtered; Detail Open, In Progress, Completed; Create Default, Create Validation Error; Update Status Confirmation.

- [ ] Create and assemble all ten maintenance frames.
- [ ] Include priority, lifecycle timestamps, property relationship, and activity history.
- [ ] Screenshot and validate the batch.

### Task 9: Complete Reports, Settings, and Global System — 18 desktop frames

**Interfaces:**
- Consumes: Charts, filters, forms, permissions, command, notification, and system-state patterns.
- Produces: Reports 4, Settings 6, Global System 8.

- [ ] Create Occupancy, Revenue, Maintenance Status, and No Data report frames.
- [ ] Create Profile, Organization, User Management, Role Matrix, Localization, and Save Confirmation settings frames.
- [ ] Create Global Search Default/Results, Command Palette, Notification Center, 403, 404, 500, and Offline/Reconnecting frames.
- [ ] Screenshot and validate all eighteen frames.

### Task 10: Complete Tablet — 16 frames

**Interfaces:**
- Consumes: Approved desktop layouts and responsive specification.
- Produces: The exact sixteen tablet frames listed in the screen inventory.

- [ ] Create tablet wrappers using the approved breakpoint and navigation behavior.
- [ ] Recompose, rather than uniformly scale, desktop information hierarchy.
- [ ] Screenshot and verify touch targets, wrapping, and overflow.

### Task 11: Complete Mobile — 24 frames

**Interfaces:**
- Consumes: Approved desktop/tablet layouts and responsive specification.
- Produces: The exact twenty-four mobile frames listed in the screen inventory.

- [ ] Create mobile wrappers and bottom-sheet/global-navigation patterns.
- [ ] Build mobile Property creation steps and validation state.
- [ ] Build simplified spatial assets plus list fallback.
- [ ] Screenshot and verify touch targets, wrapping, localization, and overflow.

### Task 12: Complete supplemental specification boards

**Interfaces:**
- Consumes: All approved product frames.
- Produces: Patterns, motion, localization, prototypes, and developer handoff boards.

- [ ] Document loading, empty, error, confirmation, search/filter, table, and form patterns.
- [ ] Document Three.js camera, raycast, selected, filtered, reduced-motion, and fallback behavior.
- [ ] Document English and Traditional Chinese expansion examples.
- [ ] Connect core prototype flows for login, property discovery, selection, create/edit, payment, and maintenance.
- [ ] Record routes, component mappings, responsive rules, API states, and Claude Code acceptance criteria.

### Task 13: Final 125-frame audit

**Interfaces:**
- Consumes: Every product frame and state ledger entry.
- Produces: A verified final delivery with no missing required frame.

- [ ] Count desktop frames and assert exactly 85.
- [ ] Count tablet frames and assert exactly 16.
- [ ] Count mobile frames and assert exactly 24.
- [ ] Assert all product text uses approved font families.
- [ ] Assert every frame has zero unintended overflow and no placeholder copy.
- [ ] Generate module contact sheets and complete the final visual review.
- [ ] Update `.figma/estateos-design-state.json` with every page and frame ID.

