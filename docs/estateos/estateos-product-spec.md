# ESTATE / OS Product Specification

## Product statement

**ESTATE / OS — Spatial Asset Intelligence Platform** is an internal property management portfolio project. It is not a commercial ERP or multi-tenant SaaS product. It must feel visually complete and operationally credible while keeping business rules understandable in an interview.

The primary demonstration path is:

```text
Login → Executive Overview → Digital Twin City → Select Property
→ Property Detail → Tenant / Contract / Payment / Maintenance
```

The Three.js building is a real representation of a `Property` entity, not decorative scenery.

## Users and roles

| Role | Scope |
|---|---|
| Admin | All operations and settings |
| Asset Manager | All business records; no system administration |
| Property Manager | Properties, tenants, contracts, maintenance |
| Accountant | Payments and reports; other data read-only |
| Maintenance Coordinator | Maintenance edit; property read-only |
| Executive Viewer | Read-only access |

The first release has no tenant or investor portal.

## Modules

### Dashboard

Shows property count, occupancy, monthly revenue, vacancy, overdue payments, expiring contracts, and open maintenance. Every metric drills down to a filtered dataset.

### Properties

CRUD, archive, search, compound filters, sorting, pagination, and desktop bulk selection. Supported types are Apartment, Studio, Townhouse, Office, and Retail. Supported states are Occupied, Vacant, Maintenance, and Archived.

### Tenants

Basic contact information, current property, active contract, and related history. Demo data must never contain real personal information.

### Contracts

Property, tenant, dates, rent, deposit, notes, and status. States: Draft, Active, Expiring Soon, Expired, and Terminated.

### Payments

Basic payment record management only. States: Pending, Paid, and Overdue. Includes amount, due date, paid date, payment method, and related property, tenant, and contract.

### Maintenance

Basic internal work orders with title, description, priority, status, assignee, and completion date. Priorities: Low, Medium, High, Urgent. States: Open, In Progress, Completed, Cancelled.

### Reports

Three fixed reports: Occupancy, Revenue, and Maintenance Status. There is no report builder.

## Information architecture

```text
Overview
Properties
Tenants
Contracts
Payments
Maintenance
Reports
Settings
```

Global capabilities include search, notifications, language switching, user menu, and a `Ctrl/Cmd + K` command palette.

## Core business rules

- Archived properties are excluded from default lists and the 3D scene.
- A property with an active contract is Occupied; without one it is Vacant.
- Only one active contract may overlap for the same property.
- Contract end date must be later than start date.
- An active contract ending within 30 days is Expiring Soon.
- A Paid payment requires `paidAt`.
- An unpaid payment past `dueDate` is Overdue.
- A Completed maintenance request requires `completedAt`.
- Frontend permissions improve UX; backend authorization remains authoritative.

## Explicit exclusions

- Tenant and investor portals
- Multi-tenant SaaS organizations and subscriptions
- Real payment gateways, refunds, invoices, partial payments, aging, or collections
- Vendor, purchasing, quotation, SLA, or accounting systems
- Real GIS and global asset support
- Microservices, event sourcing, or framework-heavy CQRS
- Enterprise workflows not needed for the portfolio demonstration

## Routes

```text
/login
/overview
/properties
/properties/:propertyId
/tenants
/tenants/:tenantId
/contracts
/contracts/:contractId
/payments
/payments/:paymentId
/maintenance
/maintenance/:requestId
/reports
/settings
```

Filters must be URL-addressable, such as `/payments?status=overdue`.

## Data model

```text
Property ─┬─< Contract >─ Tenant
          ├─< Payment
          └─< MaintenanceRequest >─ User (assignee)

Contract ──< Payment
```

Required fields and API contracts are defined by the implementation brief. Database migrations must enforce relationship integrity and critical uniqueness/conflict rules.

## Demo dataset

- 80–120 properties
- 60–90 tenants
- 70–100 contracts
- 300–600 payments
- 20–40 maintenance requests

All names and Taiwan addresses are fictional. Dashboard totals must be calculated from seed data rather than hard-coded.

