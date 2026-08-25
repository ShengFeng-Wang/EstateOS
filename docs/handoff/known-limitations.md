# Known Limitations

Claude Code records engineering caveats and deferred work here as they arise. Not for product/design ambiguities — those go in `docs/handoff/questions-for-codex.md`.

## Backend

- **`Microsoft.OpenApi` NU1903 advisory (high severity, GHSA-v5pm-xwqc-g5wc).** `Microsoft.AspNetCore.OpenApi 10.0.10/10.0.11` (the latest stable on .NET 10 as of 2026-08-25) depends on `Microsoft.OpenApi 2.x`, and every 2.x release carries this advisory; pinning `Microsoft.OpenApi` to a patched 3.x release breaks `Microsoft.AspNetCore.OpenApi`'s source generator (`IOpenApiMediaType.Example` becomes read-only, build fails). The vulnerability is in OpenAPI schema/example parsing used by the dev-time `/openapi` document generator, not in request handling. Left unpinned for now; revisit when Microsoft ships an `Microsoft.AspNetCore.OpenApi` build compatible with a patched `Microsoft.OpenApi`.
- Contract "one overlapping Active contract per property" and date-range validity are enforced in the `ContractService` application layer (interval-overlap queries), not as a database constraint — Postgres exclusion constraints could enforce this at the DB layer too but weren't added to keep the schema comprehensible per the implementation brief's guidance against over-engineering.
- Seed data (`DbSeeder`) only runs when `ASPNETCORE_ENVIRONMENT=Development` and only if `Users`/`Properties` are empty; it is not wired for a fresh production-style bring-up path yet.

## Frontend

- Only `/login` and `/overview` are wired to real API calls. All other routes (`digital-twin`, `properties`, `tenants`, `contracts`, `payments`, `maintenance`) are unstyled placeholders pending the approved visual direction from Codex's Figma handoff (`.figma/estateos-design-state.json`).
