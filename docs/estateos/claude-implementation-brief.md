# Claude Code Implementation Brief

## Assignment

Implement ESTATE / OS according to the specifications indexed in `docs/estateos/README.md`. Codex owns approved product and design decisions. Claude Code owns engineering implementation within those decisions.

For the Three.js Digital Twin, `docs/estateos/claude-threejs-implementation-spec.md` is the implementation contract. Read it and the approved visual reference before touching the scene. Do not begin from a generic Three.js demo or reinterpret the visual direction.

## Stack

### Frontend

React, TypeScript, Vite, React Router, TanStack Query, Zustand, React Hook Form, Zod, React Three Fiber, Drei, D3/SVG where useful, Vitest, React Testing Library, Playwright.

### Backend

ASP.NET Core, C#, Entity Framework Core, PostgreSQL, JWT, OpenAPI, xUnit.

Use a comprehensible API/Application/Domain/Infrastructure separation. Do not introduce microservices, event sourcing, or framework-heavy CQRS.

## Persistence model

PostgreSQL tables:

```text
users
properties
tenants
contracts
payments
maintenance_requests
```

Entity contracts:

```text
User
id, name, email, passwordHash, role, status, createdAt

Property
id, code, name, address, city, district, type, status,
monthlyRent, size, rooms, floor, description,
createdAt, updatedAt, archivedAt

Tenant
id, name, phone, email, identityReference,
emergencyContact, notes, createdAt, updatedAt

Contract
id, propertyId, tenantId, startDate, endDate,
monthlyRent, deposit, status, notes, createdAt, updatedAt

Payment
id, contractId, propertyId, tenantId, amount, dueDate,
paidAt, paymentMethod, status, notes, createdAt, updatedAt

MaintenanceRequest
id, propertyId, title, description, priority, status,
assigneeId, createdAt, updatedAt, completedAt
```

Enums:

```text
PropertyType: Apartment, Studio, Townhouse, Office, Retail
PropertyStatus: Occupied, Vacant, Maintenance, Archived
ContractStatus: Draft, Active, ExpiringSoon, Expired, Terminated
PaymentStatus: Pending, Paid, Overdue
MaintenancePriority: Low, Medium, High, Urgent
MaintenanceStatus: Open, InProgress, Completed, Cancelled
```

Critical database/application invariants:

- One overlapping Active contract per property maximum
- Contract end date later than start date
- Paid payment requires paidAt
- Completed maintenance requires completedAt
- Archive properties through archivedAt; do not physically delete

## API surface

```text
POST /api/auth/login
GET  /api/auth/me
GET  /api/dashboard/summary
GET  /api/dashboard/trends

GET/POST       /api/properties
GET/PUT/DELETE /api/properties/{id}
GET/POST       /api/tenants
GET/PUT        /api/tenants/{id}
GET/POST       /api/contracts
GET/PUT        /api/contracts/{id}
POST           /api/contracts/{id}/terminate
GET/POST       /api/payments
GET/PUT        /api/payments/{id}
GET/POST       /api/maintenance
GET/PUT        /api/maintenance/{id}

GET /api/reports/occupancy
GET /api/reports/revenue
GET /api/reports/maintenance
```

Property DELETE archives rather than physically deletes.

## State ownership

- TanStack Query: server state, caching, mutations, invalidation
- Zustand: view state, map selection, panels, global spatial filters
- URL query: durable list filters and dashboard drill-down
- Form libraries: input state and validation
- PostgreSQL/API: business truth

Do not duplicate property truth in a separate Three.js dataset.

## Required handoff from Claude Code

```text
docs/handoff/implementation-report.md
docs/handoff/known-limitations.md
docs/handoff/test-report.md
docs/handoff/spec-deviations.md
```

Material uncertainty goes into `docs/handoff/questions-for-codex.md` before implementation proceeds in that area.

## Prohibited unilateral changes

- Redesigning the approved visual direction
- Adding business modules or enterprise complexity
- Replacing the technology stack
- Reducing Three.js to decorative background animation
- Removing error, empty, responsive, localization, or accessibility states
- Replacing the UI with a generic dashboard template
- Introducing unapproved colors, fonts, or component styles
- Fabricating business data or claims

## Recommended delivery order

1. Project skeleton, database, authentication, seed data
2. Shared design tokens and component primitives
3. Properties and relationship APIs
4. Operational modules and dashboard
5. Digital Twin data contract and interaction
6. Responsive and localization
7. Testing, performance, accessibility, and documentation
