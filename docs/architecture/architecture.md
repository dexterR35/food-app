# FoodApp — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                     Browser                          │
│                                                      │
│  React 18 + Vite                                     │
│  ┌───────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ AuthCtx   │  │ TanStack     │  │ Realtime      │ │
│  │ (session, │  │ Query        │  │ Subscriptions │ │
│  │  role,    │  │ (server      │  │ (live orders, │ │
│  │  profile) │  │  state)      │  │  board status)│ │
│  └─────┬─────┘  └──────┬───────┘  └──────┬────────┘ │
│        │               │                  │          │
└────────┼───────────────┼──────────────────┼──────────┘
         │               │                  │
         ▼               ▼                  ▼
┌─────────────────────────────────────────────────────┐
│                   Supabase                           │
│                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Auth   │  │  PostgreSQL  │  │   Realtime    │  │
│  │ (JWT,    │  │  + RLS       │  │   (channels)  │  │
│  │  email/  │  │  (all data)  │  │               │  │
│  │  password│  │              │  │               │  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
│                                                      │
│  ┌──────────┐                                        │
│  │  Storage │ (avatars)                              │
│  └──────────┘                                        │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────┐
│       Vercel         │
│   (static hosting)   │
└─────────────────────┘
```

## Layer Responsibilities

### Frontend (React/Vite)
- UI rendering and user interaction
- Client-side routing (React Router v6)
- Form validation (React Hook Form + Zod)
- Body calculator logic (`utils/bodyCalc.js`)
- CSV generation (`utils/exportCsv.js`)
- All Supabase communication via `lib/supabase.js`

### Supabase Auth
- Email/password authentication
- JWT session management
- `auth.users` → triggers creation of `public.users` row

### Supabase PostgreSQL + RLS
- Single source of truth for all application data
- Row Level Security enforces role-based access at DB level
- No business logic bypasses RLS (no service role in frontend)

### Supabase Realtime
- Live order feed for admin dashboard
- Board open/close status broadcast
- User's own order status updates

### Vercel
- Hosts the static Vite build
- No serverless functions (all logic is frontend + Supabase)

---

## Data Flow

### Standard Query (TanStack Query)
```
Component renders
  → useQuery hook runs
  → queryFn calls supabase.from().select()
  → Supabase evaluates RLS for current JWT
  → Returns filtered data
  → TanStack Query caches result
  → Component renders data
```

### Real-time Update
```
DB row changes (INSERT/UPDATE/DELETE)
  → Supabase Realtime broadcasts to subscribed channels
  → useRealtime hook receives event
  → Calls queryClient.invalidateQueries([key])
  → TanStack Query refetches
  → UI updates
```

### Order Submit Flow
```
User clicks Submit
  → Zod validates cart items
  → useMutation: INSERT into orders (status=pending)
  → useMutation: INSERT order_items (with price/calorie snapshot)
  → useMutation: UPDATE orders.total_price, total_calories
  → Supabase Realtime notifies admin
  → Admin table updates live
```

---

## Security Model

### RLS Policy Summary

| Table | User reads | Admin reads | User writes | Admin writes |
|-------|-----------|------------|-------------|--------------|
| users | own row | all rows | own row | all rows |
| food_items | all (active) | all | none | all |
| boards | all | all | none | all |
| orders | own rows | all rows | own (board open) | all |
| order_items | own (via order) | all | own (board open) | all |

### Auth Guards (Frontend)
```
/                 → ProtectedRoute (approved users)
/board            → ProtectedRoute
/my-orders        → ProtectedRoute
/orders           → AdminRoute
/food             → AdminRoute
/users            → AdminRoute
/profile          → ProtectedRoute
/login            → PublicRoute (redirects if logged in)
/register         → PublicRoute
/pending          → shown to pending/rejected users
```

---

## Feature Module Structure

Each feature is self-contained:
```
src/features/<feature>/
  <Feature>Page.jsx      # page component (route target)
  components/            # feature-specific components
  hooks/                 # feature-specific hooks
  index.js               # re-exports (optional)
```

Shared between features:
```
src/components/ui/       # design system components
src/components/layout/   # AppLayout, Sidebar, Header
src/hooks/               # cross-feature hooks (useRealtime, useBoard)
src/utils/               # pure utility functions
src/context/             # AuthContext (only global context needed)
```

---

## Realtime Channel Design

```js
// Admin: all orders for today's board
supabase
  .channel('admin-orders')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'orders',
    filter: `board_id=eq.${boardId}`
  }, handler)
  .subscribe()

// User: own orders only
supabase
  .channel(`user-orders-${userId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'orders',
    filter: `user_id=eq.${userId}`
  }, handler)
  .subscribe()

// Both: board status
supabase
  .channel('board-status')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'boards',
    filter: `id=eq.${boardId}`
  }, handler)
  .subscribe()
```

All subscriptions are created in `useEffect` and cleaned up in the return function.
