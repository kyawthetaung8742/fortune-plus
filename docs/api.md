# REST API

Base URL: `/api` (or as configured). All authenticated endpoints expect:

- **Header:** `Authorization: Bearer <access_token>`

Responses: JSON. Success usually `200`/`201`; errors `4xx`/`5xx` with `{ message: string }` or validation details.

---

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/signin | No | Login with username + password; returns user + access token. |

**POST /auth/signin**

- Body: `{ "username": string, "password": string }`
- Success: `200` — `{ _id, username, name, role?, token }`
- Error: `401` — Invalid credentials

---

## Users (Admin only, except profile)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /users | Admin | List users (query: page, limit, role, is_active). |
| POST | /users | Admin | Create user (name, username, password, role). |
| GET | /users/:id | Admin | Get one user. |
| PATCH | /users/:id | Admin | Update user (name, role, is_active). |
| PATCH | /users/:id/password | Admin | Set new password. |
| GET | /auth/me | Yes | Current user profile (from JWT). |

All user create/update set `created_by`/`updated_at` from JWT.

---

## Exchange Rates

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /exchange-rates | Admin, Staff | List rates (query: pair, is_active, from, to date). |
| POST | /exchange-rates | Admin | Create rate (pair, rate, effective_at, is_active, source). |
| PATCH | /exchange-rates/:id | Admin | Update (rate, is_active, etc.). |

Audit fields set by server from JWT.

---

## Exchange Transactions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /exchange-transactions | Yes | List (query: from, to date, direction, created_by for Admin). Pagination. |
| POST | /exchange-transactions | Yes | Create transaction (direction, rate, source_amount, fee_amount?, note?, occurred_at?). |
| GET | /exchange-transactions/:id | Yes | Get one. |
| PATCH | /exchange-transactions/:id/void | Admin | Void with reason. |

Create sets `created_by`, `created_at`; target_amount computed server-side.

---

## Dashboard

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /dashboard/summary | Yes | Aggregates (e.g. count, volume by direction) for date range; Admin may pass user filter. |

---

## Error Codes

- `400` — Validation error (body or query).
- `401` — Missing or invalid token; or inactive user.
- `403` — Forbidden (role).
- `404` — Resource not found.
- `500` — Server error.
