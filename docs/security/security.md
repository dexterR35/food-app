# FoodApp — Security

## Threat Model

| Threat | Mitigation |
|--------|-----------|
| Unauthorized data access | Supabase RLS on all tables |
| Pending user accessing data | RLS + frontend auth guard (`status=approved`) |
| User seeing other user's orders | RLS `user_id = auth.uid()` |
| User modifying closed-board orders | RLS check `boards.status = 'open'` in policy |
| Price manipulation (changing food price post-order) | Prices/calories snapshotted into `order_items` at submit time |
| Admin key exposure | Service role key never in frontend; anon key only |
| Arbitrary file upload | Storage path enforced: `avatars/{user_id}/` |
| XSS | React escapes by default; no `dangerouslySetInnerHTML` |
| CSRF | Supabase JWT-based; no cookie session |
| SQL injection | Supabase JS client uses parameterized queries; no raw SQL in frontend |

---

## RLS Policies

### `users` table

```sql
-- Users can read own profile
create policy "users_select_own" on users
  for select using (auth.uid() = id);

-- Admins can read all
create policy "admins_select_all_users" on users
  for select using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- Users update own profile
create policy "users_update_own" on users
  for update using (auth.uid() = id);

-- Admins update any user
create policy "admins_update_users" on users
  for update using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- Admins delete users
create policy "admins_delete_users" on users
  for delete using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );
```

### `food_items` table

```sql
-- All approved users can read active items
create policy "users_select_active_food" on food_items
  for select using (
    is_active = true
    and exists (select 1 from users where id = auth.uid() and status = 'approved')
  );

-- Admins full access
create policy "admins_all_food" on food_items
  for all using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );
```

### `boards` table

```sql
-- All approved users read boards
create policy "users_select_boards" on boards
  for select using (
    exists (select 1 from users where id = auth.uid() and status = 'approved')
  );

-- Admins full access
create policy "admins_all_boards" on boards
  for all using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );
```

### `orders` table

```sql
-- Users read own orders
create policy "users_select_own_orders" on orders
  for select using (user_id = auth.uid());

-- Admins read all
create policy "admins_select_all_orders" on orders
  for select using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- Users insert own order if board is open
create policy "users_insert_order" on orders
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from boards
      where id = board_id and status = 'open'
    )
  );

-- Users update own order if board is open
create policy "users_update_own_order" on orders
  for update using (
    user_id = auth.uid()
    and exists (
      select 1 from boards b
      join orders o on o.board_id = b.id
      where o.id = id and b.status = 'open'
    )
  );

-- Admins update any order
create policy "admins_update_orders" on orders
  for update using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );
```

### `order_items` table

```sql
-- Users read own order items (via their order)
create policy "users_select_own_order_items" on order_items
  for select using (
    exists (select 1 from orders where id = order_id and user_id = auth.uid())
  );

-- Admins read all
create policy "admins_select_all_order_items" on order_items
  for select using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- Insert only for own orders on open boards
create policy "users_insert_order_items" on order_items
  for insert with check (
    exists (
      select 1 from orders o
      join boards b on b.id = o.board_id
      where o.id = order_id
        and o.user_id = auth.uid()
        and b.status = 'open'
    )
  );

-- Delete only own items on open boards
create policy "users_delete_own_order_items" on order_items
  for delete using (
    exists (
      select 1 from orders o
      join boards b on b.id = o.board_id
      where o.id = order_id
        and o.user_id = auth.uid()
        and b.status = 'open'
    )
  );
```

---

## Environment Variable Security

| Variable | Location | Notes |
|----------|----------|-------|
| `VITE_SUPABASE_URL` | `.env` (frontend) | Safe to expose — public |
| `VITE_SUPABASE_ANON_KEY` | `.env` (frontend) | Safe — RLS restricts access |
| `SUPABASE_SERVICE_ROLE_KEY` | **Never in frontend** | Only in Supabase dashboard |

The anon key is safe in the browser because RLS policies restrict what each user can do. The service role key bypasses RLS — it must never be in frontend code.

---

## Avatar Storage Security

```
Bucket: avatars (public)
Path enforced: avatars/{user_id}/
```

Users can only upload to their own path. Supabase Storage policies:
```sql
-- Users upload to own folder
create policy "users_upload_own_avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read (avatars are shown to other users)
create policy "public_read_avatars" on storage.objects
  for select using (bucket_id = 'avatars');

-- Users delete own avatar
create policy "users_delete_own_avatar" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## Input Validation

All user inputs validated with **Zod** schemas before any DB write.

Key schemas:
- `orderItemSchema` — quantity must be int >= 1, note max 200 chars
- `userProfileSchema` — height 50–300cm, weight 20–500kg, age 10–120
- `foodItemSchema` — price >= 0, calories >= 0, name required

Zod errors are surfaced via React Hook Form — never silently swallowed.

---

## Auth State Edge Cases

| State | Frontend behavior |
|-------|------------------|
| `status = pending` | Redirect to `/pending` screen; no data routes accessible |
| `status = rejected` | Redirect to `/rejected` screen with contact info |
| `status = approved` | Normal access |
| Session expired | `AuthContext` detects, clears state, redirects to `/login` |
| No session | `ProtectedRoute` redirects to `/login` |
