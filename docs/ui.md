# UI & Layout

## Layout

- **Admin template** with a **sidebar** and main content area.
- **Sidebar:** Logo at top (Fortune Plus), then navigation items. Collapsible on mobile; toggle on desktop.
- **Header:** Optional top bar (e.g. user menu, logout).
- **Content:** Per-route component; breadcrumbs optional.

## Routes

| Path | Auth | Component | Description |
|------|------|-----------|-------------|
| /login | No | Login | Username + password form; redirect to / after success. |
| / | Yes | Dashboard | Summary cards (e.g. today’s transactions, volume). |
| /users | Admin | UserList | List users; create/edit (modal or page). |
| /exchange-rates | Yes | ExchangeRateList | List rates; Admin: create/edit. |
| /transactions | Yes | TransactionList | List transactions; create form; detail. |

Unauthenticated access to `/`, `/users`, etc. redirects to `/login`. 401 from API clears token and redirects to login.

## Sidebar Items (by role)

- **Dashboard** — `/` (all roles).
- **User Management** (Admin only)
  - Users — `/users`
- **Exchange Rates** — `/exchange-rates` (Admin: full; Staff: read-only).
- **Transactions** — `/transactions` (all roles).

## Branding

- **Logo:** Fortune Plus logo image in sidebar header and on login page (e.g. `public/logo.png` or `assets/logo.png`).

## Components

- Reuse shared UI (buttons, inputs, tables, modals) and existing layout (e.g. `AppSidebar`, `Main`).
- Forms: validate before submit; show API errors (e.g. toast or inline).
