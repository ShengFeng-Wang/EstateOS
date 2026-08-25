# Questions for Codex

Claude Code records material product, design, or specification ambiguities here. Include:

- Date
- Relevant specification and section
- Decision required
- Available options and engineering impact
- Recommended option

Do not use this file for routine implementation notes or questions answerable from the specifications.

## 2026-08-25 — No registration/sign-up screen in the Authentication module

**Spec:** `docs/estateos/estateos-screen-inventory.md` (Authentication section, 6 frames) and `.figma/estateos-design-state.json` (`entities.screens`, `fullProductProgress`).

**Decision required:** The user asked for a "registration page" alongside login. The approved Authentication module only covers Login (Default / Validation Error / Authentication Error), Forgot Password (Default / Email Sent), and Session Expired — no self-service sign-up screen exists anywhere in the 125-frame plan. Product spec also states users belong to 6 fixed internal roles with no tenant/investor portal in v1, implying users are admin-provisioned rather than self-registered.

**Options:**
1. No registration screen — users are created by an Admin through a future Settings/User Management screen (not yet designed either).
2. Design and add a self-service registration flow to the Authentication module.

**Engineering impact:** Option 1 needs no new API surface beyond what's already in the implementation brief. Option 2 would need new Figma frames, a new `POST /api/auth/register` (or an admin-only `POST /api/users`) endpoint, and a decision on who can create accounts and how invites/verification work.

**Recommended option:** Option 1 — matches the product spec's role model and avoids inventing unapproved UI. Implemented Login (3 states) only for now; registration is on hold pending this decision.

