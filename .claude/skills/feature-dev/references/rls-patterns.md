# FoodApp — RLS Policy Patterns

## Helper Functions (already deployed in 002_rls.sql)

These functions exist in your Supabase project. Use them in all policies:

```sql
-- Check if current user is an approved admin
create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin' and status = 'approved'
  )
$$;

-- Check if current user is approved (any role)
create or replace function is_approved()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and status = 'approved'
  )
$$;
```

**Why `security definer`?** These functions run as the function owner (postgres), not as the
calling user. This bypasses RLS on the `users` table inside the function, preventing
infinite recursion (a policy on `users` that calls a function that reads `users`).

---

## Policy Templates for New Tables

### Standard user-scoped table (user owns rows)
```sql
alter table public.my_table enable row level security;

-- Approved users read own rows
create policy "users_select_own" on public.my_table
  for select using (user_id = auth.uid() and is_approved());

-- Admins read all
create policy "admins_select_all" on public.my_table
  for select using (is_admin());

-- Users insert own rows
create policy "users_insert_own" on public.my_table
  for insert with check (user_id = auth.uid() and is_approved());

-- Users update own rows
create policy "users_update_own" on public.my_table
  for update using (user_id = auth.uid() and is_approved());

-- Admins update any row
create policy "admins_update_all" on public.my_table
  for update using (is_admin());

-- Admins delete any row
create policy "admins_delete_all" on public.my_table
  for delete using (is_admin());
```

### Admin-only table (catalog, config)
```sql
alter table public.my_admin_table enable row level security;

-- Approved users read
create policy "approved_read" on public.my_admin_table
  for select using (is_approved());

-- Admins full access
create policy "admins_all" on public.my_admin_table
  for all using (is_admin());
```

### Board-gated writes (only writable when board is open)
```sql
-- Insert only if referenced board is open
create policy "insert_if_board_open" on public.my_table
  for insert with check (
    user_id = auth.uid()
    and is_approved()
    and exists (
      select 1 from public.boards
      where id = board_id and status = 'open'
    )
  );

-- Update/delete same constraint
create policy "update_if_board_open" on public.my_table
  for update using (
    user_id = auth.uid()
    and exists (
      select 1 from public.boards b
      where b.id = board_id and b.status = 'open'
    )
  );
```

---

## Testing RLS in SQL Editor

Simulate a specific user's access without logging in:

```sql
-- Set session as a specific user
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "<user-uuid>", "role": "authenticated"}';

-- Now run your query — it will be filtered by RLS as if you were that user
select * from public.orders;
```

To reset:
```sql
reset role;
```

---

## Common RLS Mistakes

**Infinite recursion:** A policy on `users` that calls `is_admin()` which reads `users`.
Prevented by `security definer` on the helper functions, but watch for new policies that
directly read `users` inside a `users` table policy.

**Missing `is_approved()` on select policies:** A `pending` user with a valid JWT can
still hit Supabase directly (bypass the frontend). The RLS policy is the last line of
defense — always include `is_approved()` on data policies.

**`for all` vs individual operations:** `for all using (...)` applies the `using` clause
to SELECT, UPDATE, DELETE but uses `with check` for INSERT. If you want different rules for
insert vs select, write separate policies.
