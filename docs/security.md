# Security & JWT

## Authentication Flow

1. **Login:** Client sends `POST /auth/signin` with `username` and `password`.
2. **Server:** Validates credentials, checks user is active; returns JWT **access token** (and optionally sets HTTP-only **refresh token** cookie).
3. **Client:** Stores access token (e.g. memory or sessionStorage); sends it in `Authorization: Bearer <token>` on every API request.
4. **Logout:** Client discards token; optionally calls `POST /auth/logout` to revoke refresh session.

## Access Token (JWT)

- **Payload:** e.g. `{ sub: userId, username, role, iat, exp }`.
- **Expiry:** Short-lived (e.g. 15 min–1 hr); configurable via env.
- **Secret:** Stored in server env (`JWT_SECRET`); never sent to client.

## Refresh Token (Optional)

- Stored in **HTTP-only cookie** (e.g. `refreshToken`); not readable by JS.
- Long-lived (e.g. 7 days); used to get new access token via `POST /auth/refresh`.
- Server stores hash in `sessions`; revoke on logout or when rotating.

## Role-Based Access

- **Admin:** Full access to users, exchange rates, transactions, dashboard, void.
- **Staff:** Signin, profile, list/create transactions, list rates (read-only), dashboard (own data or as configured).

API middleware checks `req.user.role` after JWT verification and returns `403` when role is insufficient.

## Passwords

- Stored as **bcrypt** hash (e.g. rounds 12).
- Never returned in API responses.

## Audit

- Every create/update uses `req.user._id` for `created_by` and server timestamp for `created_at`/`updated_at`.
