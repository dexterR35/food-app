# FoodApp — Design Spec
**Date:** 2026-03-18
**Status:** Approved
**Stack:** React 18 + Vite · Supabase · Vercel · Tailwind CSS · TanStack Table/Query

---

## 1. Overview

Internal department food ordering app for ~40–50 people. Each workday an admin creates a board; users pick items from the global food catalog, build a cart, and submit an order. Admin monitors orders in real-time, closes the board when ordering ends, and exports a CSV of the day's orders.

A secondary feature (Profile → Body Calculator) lets users set health goals and see calorie/macro targets — integrated in the profile page, not a separate app.

---

## 2. Architecture

**Pattern:** Supabase-only (Auth + PostgreSQL + Realtime + RLS). No custom server. Vercel serves the static frontend.

```
Browser (React/Vite)
  │
  ├── Supabase Auth       — email/password, JWT sessions
  ├── Supabase DB (RLS)   — all data, enforced at DB level
  └── Supabase Realtime   — live order feed (admin + user)

Vercel                    — static hosting, no serverless functions needed
```

---

## 3. Data Model

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | from auth.users |
| email | text unique | |
| username | text unique | |
| nickname | text | |
| avatar_url | text | |
| department | text | |
| role | enum(admin, user) | default: user |
| status | enum(pending, approved, rejected) | default: pending |
| height_cm | int | profile/body calc |
| weight_kg | numeric | |
| age | int | |
| gender | enum(male, female, other) | |
| activity_level | enum(sedentary, light, moderate, active, very_active) | |
| goal | enum(lose, maintain, gain) | |
| created_at | timestamptz | |

### `food_items`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name | text | |
| description | text | |
| price | numeric(10,2) | |
| calories | int | per serving |
| protein_g | numeric | |
| carbs_g | numeric | |
| fat_g | numeric | |
| category | text | e.g. Main, Salad, Drink, Dessert |
| image_url | text | |
| is_active | boolean | default: true |
| created_at | timestamptz | |

### `boards`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| date | date unique | one board per day |
| title | text | e.g. "Monday Board" |
| status | enum(open, closed) | admin toggles |
| created_by | uuid FK → users | admin |
| created_at | timestamptz | |

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| board_id | uuid FK → boards | |
| user_id | uuid FK → users | |
| status | enum(pending, confirmed, cancelled) | `pending` = submitted; `confirmed` = admin acknowledged (future use, currently same as pending); `cancelled` = user cancelled |
| total_price | numeric(10,2) | computed on submit |
| total_calories | int | computed on submit |
| submitted_at | timestamptz | |
| created_at | timestamptz | |

### `order_items`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| order_id | uuid FK → orders | |
| food_item_id | uuid FK → food_items | |
| quantity | int | |
| unit_price | numeric(10,2) | snapshot at order time |
| unit_calories | int | snapshot at order time |
| note | text | user note per item |

---

## 4. Auth & RBAC

- **Registration:** email/password self-signup → `users` row auto-created via trigger with `status=pending`
- **Access gate:** approved users only. `AuthContext` checks `status=approved` before granting app access. Pending/rejected users see a waiting screen.
- **First admin:** manually set in Supabase SQL Editor
- **Roles:**
  - `admin` — full access: create/close boards, CRUD food catalog, manage users, see all orders, export CSV
  - `user` — scoped: see today's board, place/edit own order (while board open), view own order history, manage own profile
- **RLS:** enforced at DB level for all tables. App-level checks use `isAdmin` from AuthContext.

---

## 5. Key Flows

### Admin: Start the Day
1. Log in → Dashboard
2. Click "Create Today's Board" (disabled if board exists for today)
3. Board status = `open` → users can now order
4. Admin monitors `/orders` in real-time
5. Click "Close Board" → `status=closed` → users can no longer edit
6. Export CSV button → downloads today's orders

### User: Place an Order
1. Log in → sees today's board (if open)
2. Browse food catalog grid (cards with image, name, price, calories)
3. Add items to cart (quantity selector per item)
4. Review cart (running total: price + calories)
5. Submit → order saved → appears in their order table
6. Can edit/cancel while board is `open`
7. Once board closes → order is locked

### Admin: Manage Users
1. `/users` page → table of all users with status filter
2. Approve/reject pending users
3. Edit user details, change role, delete user

---

## 6. Real-time Strategy

Supabase Realtime channels:
- `orders:board_id=<id>` — admin subscribes; receives INSERT/UPDATE/DELETE on orders + order_items for today's board
- `orders:user_id=<id>` — user subscribes to own orders
- `boards:date=today` — both admin and user subscribe to detect open/closed state change

TanStack Query invalidation on realtime events ensures UI stays in sync.

---

## 7. UI / Design System

**Theme:** Dark mode only
**Colors:**
```
bg-primary:     #0a0f0a   (page background)
bg-card:        #111811   (card/panel background)
bg-elevated:    #1a2a1a   (inputs, hover states)
border:         #1a4d1a   (all borders)
accent:         #22c55e   (green-500, CTAs, active states)
accent-hover:   #16a34a   (green-600)
accent-dim:     #14532d   (green-900, badges, subtle highlights)
text-primary:   #f0fdf4   (green-50)
text-secondary: #86efac   (green-300)
text-muted:     #4ade80   (green-400, labels)
danger:         #ef4444   (errors, delete)
warning:        #f59e0b   (pending status)
```

**Components:**
- `StatCard` — icon + label + value, used for totals (orders, spend, calories)
- `FoodCard` — image, name, category badge, price, calories, add-to-cart button
- `DataTable` — TanStack Table wrapper, sortable columns, sticky header
- `BoardStatus` — pill badge (open=green, closed=gray)
- `CartDrawer` — slide-in right panel, item list, totals, submit button
- `UserAvatar` — initials fallback if no image

**Typography:** Inter font
**Borders:** `rounded-lg` on cards, `rounded-md` on inputs/buttons, all with `border border-[#1a4d1a]`

---

## 8. Dashboard Stats Cards

Admin dashboard:
- Total orders today
- Total revenue today (sum of order totals)
- Total calories ordered today
- Pending orders count

User dashboard:
- My order today (items count)
- My spend today
- My calories today
- Goal calories remaining (from body calculator)

---

## 9. Profile & Body Calculator

Located at `/profile`. User can:
- Update avatar, username, nickname, department
- Set physical stats: height, weight, age, gender, activity level, goal
- View calculated targets:
  - **BMR** (Mifflin-St Jeor formula)
  - **TDEE** (BMR × activity multiplier)
  - **Daily calorie target** (TDEE ± deficit/surplus based on goal)
  - **Macro split** (protein, carbs, fat grams)
- Progress bar: calories consumed today vs. target

---

## 10. Navigation

```
Sidebar:
  Dashboard       /
  Today's Board   /board
  My Orders       /my-orders
  ─── (admin only) ───
  All Orders      /orders
  Food Catalog    /food
  Users           /users
  ─────────────────────
  Profile         /profile
```

---

## 11. CRUD Summary

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Food items | admin | admin | admin | admin (soft: is_active=false) |
| Boards | admin | all | admin | admin |
| Orders | user+admin | own / all | user (while open) | user (cancel, while open) |
| Users | self-register | own / all (admin) | own / admin | admin |

---

## 12. Export

Admin only: "Export CSV" button on `/orders` page exports current day's orders as one row per order line item:
```
date, username, department, food_item, quantity, unit_price, unit_calories,
line_total_price, line_total_calories, order_total_price, order_total_calories,
note, submitted_at
```
`line_total_*` = `unit_* × quantity`. `order_total_*` = sum across all items in the order (repeated per row for convenience).

---

## 13. Order Item Editing

Order items are edited via **delete + re-insert**, not UPDATE. When a user edits their order:
1. All existing `order_items` for the order are deleted
2. New `order_items` are inserted with current cart state
3. `orders.total_price` and `orders.total_calories` are updated

There is no UPDATE policy on `order_items` — this is intentional.

## 14. Body Calculator — Gender "Other"

For the `other` gender option, BMR uses the arithmetic average constant: `−78` (midpoint of male `+5` and female `−161`). This is a reasonable approximation; users who prefer can select male/female for more precise results.

## 15. Avatar Storage

The `avatars` storage bucket is **public-read** — any authenticated or unauthenticated user can read avatar images via URL. This is intentional (avatars are displayed to other team members). Write/delete is restricted to the file owner (`avatars/{user_id}/`).

## 16. Security

- All DB access via Supabase anon key + RLS (no service role key in frontend)
- RLS policies: users read own row, admin reads all; orders scoped by user_id unless admin
- `status=pending` users cannot access any data routes (enforced in AuthContext + RLS)
- Prices and calories snapshotted into `order_items` at order time (prevents retroactive price changes affecting history)
- No PII beyond email/username stored in plaintext
- Avatar uploads go to Supabase Storage with per-user path (`avatars/{user_id}/`)
