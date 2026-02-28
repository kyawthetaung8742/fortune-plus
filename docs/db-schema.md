# Database Schema (MongoDB)

All collections include **audit fields**:

- `created_by` — ObjectId (ref: `users._id`)
- `created_at` — Date
- `updated_at` — Date

Field names use **snake_case**.

---

## 1. `users`

Application users (Admin, Staff).

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| _id | ObjectId | ✓ | |
| name | String | ✓ | |
| username | String | ✓ | Unique, lowercase |
| password | String | ✓ | Bcrypt hash |
| role | String | ✓ | `"admin"` \| `"staff"` |
| is_active | Boolean | ✓ | Default `true` |
| last_login_at | Date | | |
| created_by | ObjectId | ✓ | Ref users (bootstrap admin: self) |
| created_at | Date | ✓ | |
| updated_at | Date | ✓ | |

**Indexes:** `username` (unique).

---

## 2. `exchange_rates`

Reference rates for THB ⇄ MMK (used when recording transactions).

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| _id | ObjectId | ✓ | |
| pair | String | ✓ | `"THB_MMK"` \| `"MMK_THB"` |
| rate | Number | ✓ | > 0 |
| effective_at | Date | ✓ | |
| is_active | Boolean | ✓ | Default `true` |
| source | String | | e.g. "manual" |
| created_by | ObjectId | ✓ | Ref users |
| created_at | Date | ✓ | |
| updated_at | Date | ✓ | |

**Indexes:** `{ pair: 1, effective_at: -1 }`.

---

## 3. `exchange_transactions`

Recorded THB ⇄ MMK exchange transactions.

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| _id | ObjectId | ✓ | |
| direction | String | ✓ | `"THB_TO_MMK"` \| `"MMK_TO_THB"` |
| rate | Number | ✓ | > 0 |
| source_currency | String | ✓ | `"THB"` \| `"MMK"` |
| target_currency | String | ✓ | `"THB"` \| `"MMK"` |
| source_amount | Number | ✓ | ≥ 0 |
| target_amount | Number | ✓ | ≥ 0 |
| fee_amount | Number | | ≥ 0, default 0 |
| occurred_at | Date | ✓ | Default now |
| note | String | | |
| rate_ref_id | ObjectId | | Ref exchange_rates (optional) |
| status | String | ✓ | `"completed"` \| `"void"`, default completed |
| void_reason | String | | When status = void |
| created_by | ObjectId | ✓ | Ref users |
| created_at | Date | ✓ | |
| updated_at | Date | ✓ | |

**Indexes:**

- `{ occurred_at: -1 }`
- `{ created_by: 1, occurred_at: -1 }`
- `{ direction: 1, occurred_at: -1 }`

---

## 4. `sessions` (optional)

Used when refresh-token flow is implemented (see [security.md](security.md)).

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| _id | ObjectId | ✓ | |
| user_id | ObjectId | ✓ | Ref users |
| refresh_token_hash | String | ✓ | |
| expires_at | Date | ✓ | |
| revoked_at | Date | | |
| ip, user_agent | String | | |
| created_by | ObjectId | ✓ | = user_id |
| created_at | Date | ✓ | |
| updated_at | Date | ✓ | |

**Indexes:** `{ user_id: 1, expires_at: -1 }`; optional TTL on `expires_at`.
