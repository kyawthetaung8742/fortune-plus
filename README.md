# Fortune Plus — THB ⇄ MMK Exchange Recording

Software for recording **Thailand (THB)** and **Myanmar (MMK)** currency exchange. React frontend, Node/Express backend, MongoDB, JWT auth, admin sidebar template.

## Documentation

All requirements and design are documented under **`docs/`**:

| Doc | Purpose |
|-----|--------|
| **[docs/requirements.md](docs/requirements.md)** | **Feature-based requirements** — roles, features (Auth, User Management, Exchange Rates, Transactions, Dashboard, Audit), NFRs, and links to schema/API/UI |
| [docs/db-schema.md](docs/db-schema.md) | MongoDB collections; **created_by** and **created_at** on all tables |
| [docs/api.md](docs/api.md) | REST API endpoints and auth |
| [docs/security.md](docs/security.md) | JWT and RBAC |
| [docs/ui.md](docs/ui.md) | Pages, sidebar, layout |

## Features (from requirements)

- **Authentication** — Login (username/password), JWT access token, protected routes, logout
- **User management** — Admin: list, create, edit, disable users; reset password; roles (admin/staff)
- **Exchange rates** — Admin: create/list/activate rates (THB_MMK, MMK_THB); Staff: read-only
- **Exchange transactions** — Create/list/detail THB⇄MMK transactions; optional void (Admin); filters and pagination
- **Dashboard** — Summary stats (counts, volumes) with optional date range and role-based scope
- **Audit** — Every table has `created_by` and `created_at` (and `updated_at`)

## Project structure

- **client/** — React (Vite), sidebar layout, login, dashboard, user list
- **server/** — Express, MongoDB, auth (signin, JWT), user model and seeder

## Quick start

1. Copy `server/.env.example` to `server/.env` and set `MONGO_URI`, `JWT_SECRET`.
2. Install and run server: `cd server && npm i && npm run dev`
3. Install and run client: `cd client && npm i && npm run dev`
4. (Optional) Seed users: `node server/seeders/userSeeder.js`

See [docs/requirements.md](docs/requirements.md) for full feature list and [docs/api.md](docs/api.md) for API details.
