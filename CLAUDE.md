# CLAUDE.md — FoodApp

This file provides guidance to Claude Code when working in this repository.

## Commands

```bash
npm run dev        # start dev server at http://localhost:5173
npm run build      # production build
npm run preview    # preview production build
```

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Supabase (Auth + PostgreSQL + Realtime + RLS) |
| Hosting | Vercel (static, no serverless functions) |
| Tables | TanStack Table v8 |
| Data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |

## Architecture

**Single-page React app** (Vite) with Supabase as the entire backend. No custom server. Vercel hosts the static build.

### Auth & RBAC

- `AuthContext` (`src/context/AuthContext.jsx`) — Supabase session + loads `public.users` profile. Exposes `isAdmin`, `user`, `profile`, `signIn`, `signOut`.
- Users self-register → `status=pending` → admin approves → `status=approved` → full access.
- Two roles: `admin` (full access) and `user` (own data only).
- RLS enforces at DB level. App-level checks use `isAdmin`.
- Route guards in `src/app/router.jsx`: `PublicRoute`, `ProtectedRoute` (requires approved status), `AdminRoute`.

### Data Layer

- `src/lib/supabase.js` — Supabase client (anon key only, never service role in frontend).
- TanStack Query for all data fetching and caching.
- Supabase Realtime channels for live order updates (`src/hooks/useRealtime.js`).
- Prices and calories are **snapshotted** into `order_items` at submit time.

### Key Directories

```
src/
  app/router.jsx              # all routes + guards
  context/AuthContext.jsx     # auth session, role, profile
  features/
    board/                    # today's board, food grid, cart, order submit
    orders/                   # order tables (admin all / user own)
    food/                     # food catalog CRUD (admin)
    users/                    # user management (admin), profile, body calc
    dashboard/                # stat cards, overview
  components/
    layout/                   # AppLayout, Sidebar, Header
    ui/                       # StatCard, FoodCard, DataTable, CartDrawer, Badge
    forms/                    # reusable form primitives
  hooks/
    useRealtime.js            # Supabase realtime subscriptions
    useBoard.js               # today's board state
    useOrders.js              # order queries
    useBodyCalc.js            # BMR/TDEE calculations
  utils/
    exportCsv.js              # CSV export for admin
    bodyCalc.js               # Mifflin-St Jeor, TDEE, macro split
  lib/supabase.js             # Supabase client

supabase/
  migrations/                 # SQL migrations — run in order
  seeds/                      # seed data
```

## Design System

Dark mode only. See `docs/design/design-system.md` for full token reference.

Quick reference:
- Background: `#0a0f0a`
- Cards: `#111811`
- Borders: `#1a4d1a`
- Accent: `#22c55e` (green-500)
- Text: `#f0fdf4`

Always use CSS variables defined in `src/index.css`, not hardcoded hex values.

## Database Setup (one-time)

Run in Supabase SQL Editor in order:
1. `supabase/migrations/001_schema.sql` — all tables
2. `supabase/migrations/002_rls.sql` — RLS policies
3. `supabase/migrations/003_triggers.sql` — user auto-create trigger
4. `supabase/seeds/001_food_items.sql` — sample food items

First admin must be manually set:
```sql
update public.users set role = 'admin', status = 'approved' where email = 'you@example.com';
```

## Environment Variables

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Never put service role key in frontend or `.env`.

## Coding Conventions

- Components: PascalCase, one per file
- Hooks: camelCase starting with `use`
- Feature folders own their pages, components, and hooks
- Shared UI in `components/ui/`
- All Supabase calls go through TanStack Query (`useQuery`, `useMutation`)
- Realtime subscriptions in dedicated hooks, not inside components
- Zod schemas for all form validation
- No inline styles — Tailwind classes only
- Tables always use `DataTable` component (TanStack Table wrapper)

## Agents

See `.claude/agents/` for specialized agents:
- `critical-agent.md` — architecture review and blockers
- `positive-agent.md` — feature validation and encouragement
- `code-review-agent.md` — code quality and security review
