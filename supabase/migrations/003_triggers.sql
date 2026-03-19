-- FoodApp — Triggers
-- Run after 002_rls.sql

-- Auto-create public.users row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, username, status, role)
  values (
    new.id,
    new.email,
    -- Default username from email prefix (user can change later)
    split_part(new.email, '@', 1),
    'pending',
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger on auth.users insert
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
