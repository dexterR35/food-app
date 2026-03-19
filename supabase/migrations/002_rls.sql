-- FoodApp — RLS Policies
-- Run after 001_schema.sql

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.food_items enable row level security;
alter table public.boards enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Helper function to check if current user is admin
create or replace function is_admin()
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid()
      and role = 'admin'
      and status = 'approved'
  )
$$;

-- Helper function to check if current user is approved
create or replace function is_approved()
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid()
      and status = 'approved'
  )
$$;

-- ============================================================
-- USERS
-- ============================================================

-- Users read own profile
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

-- Admins read all users
create policy "admins_select_all_users" on public.users
  for select using (is_admin());

-- Users update own profile
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- Admins update any user
create policy "admins_update_any_user" on public.users
  for update using (is_admin());

-- Admins delete users
create policy "admins_delete_users" on public.users
  for delete using (is_admin());

-- Allow insert only via trigger (no direct insert from frontend)
create policy "trigger_insert_users" on public.users
  for insert with check (auth.uid() = id);

-- ============================================================
-- FOOD ITEMS
-- ============================================================

-- Approved users read active food items
create policy "approved_users_select_active_food" on public.food_items
  for select using (is_active = true and is_approved());

-- Admins read all food items (including inactive)
create policy "admins_select_all_food" on public.food_items
  for select using (is_admin());

-- Admins insert food items
create policy "admins_insert_food" on public.food_items
  for insert with check (is_admin());

-- Admins update food items
create policy "admins_update_food" on public.food_items
  for update using (is_admin());

-- Admins delete food items
create policy "admins_delete_food" on public.food_items
  for delete using (is_admin());

-- ============================================================
-- BOARDS
-- ============================================================

-- Approved users read boards
create policy "approved_users_select_boards" on public.boards
  for select using (is_approved());

-- Admins create boards
create policy "admins_insert_boards" on public.boards
  for insert with check (is_admin());

-- Admins update boards (e.g. close)
create policy "admins_update_boards" on public.boards
  for update using (is_admin());

-- Admins delete boards
create policy "admins_delete_boards" on public.boards
  for delete using (is_admin());

-- ============================================================
-- ORDERS
-- ============================================================

-- Users read own orders (approved users only)
create policy "users_select_own_orders" on public.orders
  for select using (user_id = auth.uid() and is_approved());

-- Admins read all orders
create policy "admins_select_all_orders" on public.orders
  for select using (is_admin());

-- Users insert order if board is open (and they don't already have one)
create policy "users_insert_order" on public.orders
  for insert with check (
    user_id = auth.uid()
    and is_approved()
    and exists (
      select 1 from public.boards
      where id = board_id and status = 'open'
    )
  );

-- Users update own order if board is open
create policy "users_update_own_order" on public.orders
  for update using (
    user_id = auth.uid()
    and exists (
      select 1 from public.boards b
      where b.id = board_id and b.status = 'open'
    )
  );

-- Admins update any order
create policy "admins_update_orders" on public.orders
  for update using (is_admin());

-- ============================================================
-- ORDER ITEMS
-- ============================================================

-- Users read own order items (approved users only)
create policy "users_select_own_order_items" on public.order_items
  for select using (
    is_approved()
    and exists (
      select 1 from public.orders
      where id = order_id and user_id = auth.uid()
    )
  );

-- Admins read all order items
create policy "admins_select_all_order_items" on public.order_items
  for select using (is_admin());

-- Users insert items for own open-board order
create policy "users_insert_order_items" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      join public.boards b on b.id = o.board_id
      where o.id = order_id
        and o.user_id = auth.uid()
        and b.status = 'open'
    )
  );

-- Users delete own items on open board (for order edit)
create policy "users_delete_own_order_items" on public.order_items
  for delete using (
    exists (
      select 1 from public.orders o
      join public.boards b on b.id = o.board_id
      where o.id = order_id
        and o.user_id = auth.uid()
        and b.status = 'open'
    )
  );
