---
name: feature-dev
description: >
  FoodApp feature development guide. Use this skill whenever you are adding, modifying,
  or extending any feature in FoodApp — including new pages, hooks, components, Supabase
  queries, RLS policies, or realtime subscriptions. Trigger this even if the request seems
  simple (e.g. "add a column to the orders table") because almost every change in FoodApp
  touches auth, RLS, and realtime in ways that are easy to get wrong. Also use when the
  user asks "how do I implement X in FoodApp", "can you add Y to the board page", or
  "I need a new admin feature".
---

# FoodApp — Feature Development

This skill guides you through adding or modifying features in FoodApp correctly. The app
has a strict architecture (Supabase-only, RLS-enforced, realtime-subscribed) where one
missed step causes silent data leaks or broken UI. This skill exists so you don't have to
rediscover those traps.

## Before You Write a Single Line

Answer these questions. They aren't a formality — each one maps to a real class of bug
that has caused issues in this codebase.

### 1. Does this touch the database?

If yes, write the migration **first**, before any frontend code. Schema changes without RLS
updates are the #1 source of data leaks in this app.

- New table → `supabase/migrations/00N_<name>.sql` with schema + RLS in the same file
- New column on existing table → same migration file pattern
- No schema changes → skip to step 2

See `references/rls-patterns.md` for policy templates.

### 2. Who can access this data?

Every query in FoodApp must pass through RLS. Before writing a `useQuery`, ask:

| Scenario | RLS requirement |
|----------|----------------|
| User reads own data | `user_id = auth.uid()` |
| Admin reads all | `is_admin()` helper function |
| Approved users only | `is_approved()` helper function |
| Open board only (writes) | join to `boards` where `status = 'open'` |

If you're unsure whether RLS covers your case, test it in Supabase SQL Editor first.
See `references/rls-patterns.md` for `is_admin()` and `is_approved()` function definitions.

### 3. Does this need real-time updates?

If the feature shows data that changes while the user is on the page (orders, board status,
user approvals), it needs a Supabase Realtime subscription. Use `useRealtime.js` — don't
create raw subscriptions in components because the cleanup pattern is error-prone.

```js
// src/hooks/useRealtime.js — always use this, never raw supabase.channel() in components
useRealtime({
  channel: 'unique-channel-name',
  table: 'table_name',
  filter: 'column=eq.value',        // narrow the subscription
  queryKeys: [['query-key-to-invalidate']]
})
```

The filter matters. A broad subscription (entire table) hammers every client with every
change. Scope it to what the component actually cares about.

### 4. Which route guard applies?

```
ProtectedRoute  → any approved user (status = 'approved')
AdminRoute      → admin only (role = 'admin' + approved)
PublicRoute     → unauthenticated only (redirects logged-in users away)
```

Forgetting `AdminRoute` on an admin page means any approved user can navigate there — RLS
will block the data, but the page renders broken UI instead of a proper redirect.

---

## Implementation Pattern

FoodApp follows a strict layering. Deviating from it makes future changes harder.

```
Page Component
  └── calls custom hook (useOrders, useBoard, etc.)
        └── uses TanStack Query (useQuery / useMutation)
              └── calls supabase.from()...
                    └── Supabase RLS enforces access
```

**Never** put `supabase.from()` calls inside a JSX component body. They belong in hooks.
This isn't dogma — it's because components re-render often, and direct Supabase calls in
render functions create uncontrolled side effects and are impossible to cache properly.

### Query pattern

```js
// src/features/<feature>/hooks/use<Name>.js
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'

export function useMyData(id) {
  return useQuery({
    queryKey: ['my-data', id],        // include all filter variables in the key
    enabled: !!id,                    // don't run if id is undefined
    queryFn: async () => {
      const { data, error } = await supabase
        .from('my_table')
        .select('id, name, created_at')   // never select('*') — be explicit
        .eq('id', id)
      if (error) throw error          // always propagate errors
      return data
    },
  })
}
```

### Mutation pattern

```js
export function useSaveMyData() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from('my_table')
        .upsert(payload)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      // invalidate all queries that depend on this data
      queryClient.invalidateQueries({ queryKey: ['my-data'] })
    },
  })
}
```

---

## UI Conventions

FoodApp is dark mode only. Every visual element uses CSS variable tokens, not hardcoded
colors. This makes the design consistent and lets us theme in the future.

**Use Tailwind classes with `food-` prefix:**
```jsx
// ✅ correct
<div className="bg-food-card border border-food-border rounded-xl p-5">

// ❌ wrong — hardcoded hex, breaks if theme changes
<div style={{ backgroundColor: '#111811' }}>
```

Every component that fetches data needs three states or the UI feels broken:

```jsx
if (isLoading) return <LoadingSpinner />
if (!data?.length) return <EmptyState title="No X yet" description="..." />
// ...render data
```

See `references/design-system-tokens.md` for the full token list and component examples.

---

## Critical Rules (the ones that cause real bugs)

**Snapshot prices and calories.** When an order is submitted, copy `food_items.price` and
`food_items.calories` into `order_items.unit_price` and `order_items.unit_calories`. Never
read back from `food_items` for historical orders — if an admin changes a price, history
must be unaffected.

**Board date is local time.** Always use `new Date().toLocaleDateString('en-CA')` for
today's date (gives `YYYY-MM-DD` in local timezone). `toISOString()` is UTC and will give
the wrong day in the evening for European users.

**One order per user per board.** The DB has a `UNIQUE(board_id, user_id)` constraint on
`orders`. Don't try to insert a new order if one exists — update it.

**Realtime cleanup.** Every `useEffect` that calls `supabase.channel().subscribe()` must
return `() => supabase.removeChannel(channel)`. Missing this leaks connections and causes
duplicate events.

---

## Reference Files

When you need them (don't load them all upfront):

- `references/api-patterns.md` — Complete Supabase query reference for every table
- `references/rls-patterns.md` — RLS policy templates and helper functions
