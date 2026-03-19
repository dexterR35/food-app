-- Allow deleting food_items while keeping order history: snapshot name + nullable FK

alter table public.order_items
  add column if not exists item_name text;

update public.order_items oi
set item_name = coalesce(nullif(trim(oi.item_name), ''), fi.name)
from public.food_items fi
where oi.food_item_id is not null
  and oi.food_item_id = fi.id
  and (oi.item_name is null or btrim(oi.item_name) = '');

-- Drop any FK order_items → food_items (works even if constraint name differs)
do $$
declare
  r record;
begin
  for r in
    select c.conname as fk_name
    from pg_constraint c
    where c.conrelid = 'public.order_items'::regclass
      and c.confrelid = 'public.food_items'::regclass
      and c.contype = 'f'
  loop
    execute format('alter table public.order_items drop constraint %I', r.fk_name);
  end loop;
end $$;

alter table public.order_items
  alter column food_item_id drop not null;

alter table public.order_items
  add constraint order_items_food_item_id_fkey
  foreign key (food_item_id) references public.food_items(id) on delete set null;
