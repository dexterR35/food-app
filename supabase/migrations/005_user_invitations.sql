-- Invitation-only signup flow

create table if not exists public.user_invitations (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  role user_role not null default 'user',
  invited_by uuid not null default auth.uid() references public.users(id),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz
);

create or replace function public.normalize_invitation_email()
returns trigger
language plpgsql
as $$
begin
  new.email := lower(trim(new.email));
  return new;
end;
$$;

create or replace trigger normalize_user_invitation_email
  before insert or update on public.user_invitations
  for each row execute procedure public.normalize_invitation_email();

create or replace function public.prevent_inviting_existing_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if exists (
    select 1
    from public.users u
    where lower(u.email) = lower(new.email)
  ) then
    raise exception 'User already exists for this email.';
  end if;
  return new;
end;
$$;

create or replace trigger prevent_inviting_existing_user
  before insert or update on public.user_invitations
  for each row execute procedure public.prevent_inviting_existing_user();

alter table public.user_invitations enable row level security;

create policy "admins_select_invitations" on public.user_invitations
  for select using (is_admin());

create policy "admins_insert_invitations" on public.user_invitations
  for insert with check (is_admin() and role = 'user' and invited_by = auth.uid());

create policy "admins_update_invitations" on public.user_invitations
  for update using (is_admin());

create policy "admins_delete_invitations" on public.user_invitations
  for delete using (is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  invited public.user_invitations;
begin
  select * into invited
  from public.user_invitations
  where email = lower(new.email)
  limit 1;

  if invited is null then
    raise exception 'Signup is invitation-only. Ask an admin to invite this email first.';
  end if;

  insert into public.users (id, email, username, status, role)
  values (
    new.id,
    lower(new.email),
    split_part(lower(new.email), '@', 1),
    'approved',
    invited.role
  )
  on conflict (id) do nothing;

  update public.user_invitations
    set accepted_at = coalesce(accepted_at, now())
  where id = invited.id;

  return new;
end;
$$;
