# ESTATE / OS Screen Inventory

## Figma pages

```text
00 Cover
01 Design Read
02 Foundations
03 Components
04 Patterns
05 Authentication
06 Executive Overview
07 Properties
08 Tenants
09 Contracts
10 Payments
11 Maintenance
12 Reports
13 Settings
14 System States
15 Responsive
16 Prototype Flows
17 Motion & 3D
18 Localization
19 Developer Handoff
99 Archive
```

Frame naming: `[Platform] / [Module] / [Screen] / [State] / [Locale]`.

## Desktop — 85 frames

| Module | Frames |
|---|---:|
| Authentication | 6 |
| Executive Overview | 9 |
| Properties | 14 |
| Tenants | 9 |
| Contracts | 10 |
| Payments | 9 |
| Maintenance | 10 |
| Reports | 4 |
| Settings | 6 |
| Global System | 8 |

### Authentication

Login Default, Validation Error, Authentication Error; Forgot Password Default and Email Sent; Session Expired.

### Executive Overview

Default, Loading, Empty Portfolio, Partial Data Error, Date Range Changed; Spatial Map Default, Building Hovered, Building Selected, Filtered.

### Properties

List Default, Loading, Empty, Search Results, No Results, Filtered, Row Selected, Bulk Selection; Detail Occupied, Vacant, Maintenance; Create Default and Validation Error; Edit with Archive Confirmation.

Property Detail tabs: Overview, Tenant, Contract, Payments, Maintenance. Important tab content receives spec boards without duplicating the entire page unnecessarily.

### Tenants

List Default, Loading, Empty, Search Results, Filtered; Detail Active Lease and No Active Lease; Create Default; Edit Validation Error.

### Contracts

List Default, Loading, Empty, Filtered; Detail Active, Expiring Soon, Expired; Create Default and Validation Error; Edit with Terminate Confirmation.

### Payments

List Default, Loading, Empty, Filtered, Overdue; Detail Paid, Pending, Overdue; Record Payment Validation Error.

### Maintenance

List Default, Loading, Empty, Filtered; Detail Open, In Progress, Completed; Create Default and Validation Error; Update Status Confirmation.

### Reports

Occupancy, Revenue, Maintenance Status, No Data.

### Settings

Profile, Organization, User Management, Role and Permission Matrix, Localization Preferences, Save Confirmation.

### Global System

Global Search Default and Results; Command Palette; Notification Center; 403; 404; 500; Offline/Reconnecting.

## Tablet — 16 frames

Login; Overview; Spatial Map Default and Property Selected; Property List and Filters Open; Property Detail Overview and Related Records; Create Property; Tenant List and Detail; Contract Detail; Payment List; Maintenance List and Detail; Command Palette.

## Mobile — 24 frames

Login Default and Validation Error; Overview Default and Metrics Expanded; Spatial Assets Simplified and List Fallback; Property Selected Bottom Sheet; Property List, Search, Filters, Detail Overview, Detail Related Records, Create Steps 1–2 and Validation Error; Tenant List and Detail; Contract Detail; Payment List and Overdue Detail; Maintenance List, Detail, Create; Global Navigation Open.

## Supplemental boards

- Foundations, components, and patterns: 20–30
- Localization examples: 8
- Motion and 3D: 8–12
- Developer handoff: 6–10

Expected total after the approved 125 product frames and supplemental specification boards: approximately 165–190 frames/boards. This refines the early estimate after the desktop and responsive inventories were approved. Count is secondary to state, responsive, localization, interaction, and handoff completeness.
