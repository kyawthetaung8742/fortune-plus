# Fortune Plus — Feature-Based Requirements

Software for recording **Thailand (THB)** and **Myanmar (MMK)** currency exchange. This document defines features, user roles, and traceability to database schema, API, and UI.

---

## 1. Overview

| Item | Description |
|------|-------------|
| **Product** | Fortune Plus — THB ⇄ MMK exchange recording system |
| **Users** | Admin, Staff (see [§2](#2-user-roles)) |
| **Stack** | React (client), Node/Express (server), MongoDB |
| **Auth** | JWT (access + optional refresh), see [docs/security.md](security.md) |

**Audit rule (all tables):** Every collection MUST include `created_by` (ObjectId → users) and `created_at` (Date). See [docs/db-schema.md](db-schema.md).

---

## 2. User Roles

| Role | Description | Access |
|------|-------------|--------|
| **Admin** | Full system access | All features: auth, users, exchange rates, transactions, dashboard, settings |
| **Staff** | Day-to-day operations | Auth, view/create exchange rates (read-only rates), create/list own transactions, dashboard |

Role is stored in `users.role`. API enforces role-based access; see [docs/api.md](api.md).

---

## 3. Features

### 3.1 Authentication (Login)

| ID | Requirement | Detail |
|----|-------------|--------|
| F-AUTH-01 | Login | User signs in with **username** and **password**. |
| F-AUTH-02 | JWT | Server returns **access token** (JWT) for API authorization. |
| F-AUTH-03 | Refresh (optional) | Optional refresh token in HTTP-only cookie for long sessions; see [security.md](security.md). |
| F-AUTH-04 | Logout | Client discards token; optional: server revokes refresh session. |
| F-AUTH-05 | Protected routes | All app routes except `/login` require valid JWT; 401 triggers redirect to login. |

**API:** `POST /auth/signin` — see [api.md](api.md).  
**UI:** Login page; sidebar and main layout only when authenticated — see [ui.md](ui.md).

---

### 3.2 User Management

| ID | Requirement | Detail |
|----|-------------|--------|
| F-USER-01 | List users | Admin can list users with optional filters (role, active). Pagination supported. |
| F-USER-02 | Create user | Admin can create user: name, username, password, role (admin/staff). |
| F-USER-03 | Edit user | Admin can update name, role, active status. |
| F-USER-04 | Disable user | Admin can set user inactive; inactive users cannot sign in. |
| F-USER-05 | Reset password | Admin can set a new password for a user. |
| F-USER-06 | Audit | `users` has `created_by`, `created_at`, `updated_at`. First admin may have `created_by` self-reference. |

**API:** `GET/POST/PATCH /users`, `PATCH /users/:id/password` — [api.md](api.md).  
**Schema:** [db-schema.md](db-schema.md#1-users).  
**UI:** Sidebar → User Management → Users (list, create, edit) — [ui.md](ui.md).

---

### 3.3 Exchange Rate Management

| ID | Requirement | Detail |
|----|-------------|--------|
| F-RATE-01 | Create rate | Admin creates an exchange rate: pair (THB_MMK / MMK_THB), rate, effective_at, optional source. |
| F-RATE-02 | List rates | Admin and Staff can list rates; filter by pair, active, date range. |
| F-RATE-03 | Activate/Deactivate | Admin can mark a rate active/inactive for use in transactions. |
| F-RATE-04 | Audit | `exchange_rates` has `created_by`, `created_at`, `updated_at`. |

**API:** `GET/POST /exchange-rates`, `PATCH /exchange-rates/:id` — [api.md](api.md).  
**Schema:** [db-schema.md](db-schema.md#2-exchange_rates).  
**UI:** Sidebar → Exchange Rates (admin: full CRUD; staff: read-only) — [ui.md](ui.md).

---

### 3.4 Exchange Transaction Recording

| ID | Requirement | Detail |
|----|-------------|--------|
| F-TXN-01 | Create transaction | Staff/Admin records a transaction: direction (THB_TO_MMK | MMK_TO_THB), rate, source amount, optional fee, note, occurred_at. |
| F-TXN-02 | Auto-calculate | System computes target amount from rate (and optional fee). Rounding rules configurable (e.g. 2 decimals). |
| F-TXN-03 | List transactions | User can list transactions with filters: date range, direction, created_by (Admin can filter by any user). Pagination. |
| F-TXN-04 | View detail | User can open a single transaction (by id). |
| F-TXN-05 | Void (optional) | Admin can void a transaction with reason; status = void, no deletion. |
| F-TXN-06 | Audit | `exchange_transactions` has `created_by`, `created_at`, `updated_at`. |

**API:** `GET/POST /exchange-transactions`, `GET /exchange-transactions/:id`, optional `PATCH .../void` — [api.md](api.md).  
**Schema:** [db-schema.md](db-schema.md#3-exchange_transactions).  
**UI:** Sidebar → Transactions (list, create form, detail) — [ui.md](ui.md).

---

### 3.5 Dashboard & Reporting

| ID | Requirement | Detail |
|----|-------------|--------|
| F-DASH-01 | Dashboard home | Authenticated user sees a dashboard: summary cards (e.g. today’s transaction count, total volume by direction). |
| F-DASH-02 | Date range | Optional date filter for dashboard stats. |
| F-DASH-03 | Role-based | Staff see own stats; Admin can see all or filter by user. |

**API:** `GET /dashboard/summary` (or derived from transaction list with aggregates) — [api.md](api.md).  
**UI:** Default route `/` — [ui.md](ui.md).

---

### 3.6 Audit (All Tables)

| ID | Requirement | Detail |
|----|-------------|--------|
| F-AUDIT-01 | created_by | Every insert sets `created_by` to the authenticated user’s `_id`. |
| F-AUDIT-02 | created_at | Every insert sets `created_at` (server time). |
| F-AUDIT-03 | updated_at | All tables support `updated_at`; updated on every change. |

**Schema:** Every collection in [db-schema.md](db-schema.md) includes these fields.  
**API:** Create/update endpoints receive user from JWT and set audit fields server-side.

---

## 4. Non-Functional Requirements

| ID | Area | Requirement |
|----|------|-------------|
| NFR-01 | Security | JWT for API auth; password hashing (bcrypt); RBAC per role. |
| NFR-02 | UI | Admin template with sidebar navigation; responsive layout. |
| NFR-03 | Branding | Logo (Fortune Plus) in sidebar header and login page. |
| NFR-04 | Validation | Input validation on all API payloads; clear error messages. |
| NFR-05 | Performance | Pagination on list endpoints; indexes as per db-schema. |

---

## 5. Document Traceability

| Document | Purpose |
|----------|---------|
| [docs/requirements.md](requirements.md) | This file — feature list and high-level requirements |
| [docs/db-schema.md](db-schema.md) | MongoDB collections, fields, indexes, audit fields |
| [docs/api.md](api.md) | REST endpoints, request/response, auth, roles |
| [docs/security.md](security.md) | JWT flow, refresh token, cookie, logout |
| [docs/ui.md](ui.md) | Pages, routes, sidebar items, layout |

When adding or changing a feature, update the relevant requirement above and the linked doc (schema, API, or UI).
