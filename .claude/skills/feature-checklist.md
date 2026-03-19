---
name: feature-checklist
description: Use before starting any new feature in FoodApp to ensure all contracts are respected
---

# FoodApp Feature Checklist

Before writing any code for a new feature, answer these questions:

## 1. Data
- [ ] Does this feature need a new table or column? → Write a migration first.
- [ ] Does it read data? → Does RLS allow it? Check `002_rls.sql`.
- [ ] Does it write data? → Does RLS allow it? Does it respect board open/closed status?
- [ ] Does it display prices or calories from history? → Use `order_items.unit_price/unit_calories`, NOT `food_items.price/calories`.

## 2. Auth
- [ ] Is this admin-only? → Wrap route with `AdminRoute`. Add `is_admin()` check to RLS.
- [ ] Is this user-only? → Wrap with `ProtectedRoute`. Ensure `status='approved'` check exists.
- [ ] Does it expose any data to unapproved users? → It must not.

## 3. Realtime
- [ ] Does this feature need live updates? → Add to `useRealtime.js`. Clean up on unmount.
- [ ] Does it affect the board status? → Ensure board-status channel is active on this page.

## 4. UI
- [ ] Uses dark green design tokens? (no hardcoded colors)
- [ ] Has loading state?
- [ ] Has empty state?
- [ ] Has error state?
- [ ] Tables use `DataTable` component?
- [ ] Forms use React Hook Form + Zod?

## 5. Code Quality
- [ ] Data fetching is in a hook, not inline in component?
- [ ] No direct Supabase calls in JSX?
- [ ] TanStack Query used for server state?
- [ ] Mutation invalidates the right query keys on success?
