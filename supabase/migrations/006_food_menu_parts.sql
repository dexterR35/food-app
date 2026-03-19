-- Optional combo/menu parts for food items (e.g. potatoes + beef + salad)
alter table public.food_items
  add column if not exists menu_parts text[];

alter table public.food_items
  drop constraint if exists food_items_menu_parts_max_3;

alter table public.food_items
  add constraint food_items_menu_parts_max_3
  check (menu_parts is null or array_length(menu_parts, 1) <= 3);
