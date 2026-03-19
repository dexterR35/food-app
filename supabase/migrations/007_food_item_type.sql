-- Food item type: main (single pick) or menu (3-piece combo)
-- menu_parts must exist first (same as 006); safe if 006 already ran
alter table public.food_items
  add column if not exists menu_parts text[];

alter table public.food_items
  drop constraint if exists food_items_menu_parts_max_3;

alter table public.food_items
  add constraint food_items_menu_parts_max_3
  check (menu_parts is null or array_length(menu_parts, 1) <= 3);

alter table public.food_items
  add column if not exists item_type text not null default 'main';

alter table public.food_items
  drop constraint if exists food_items_item_type_check;

alter table public.food_items
  add constraint food_items_item_type_check
  check (item_type in ('main', 'menu'));

alter table public.food_items
  drop constraint if exists food_items_menu_parts_for_type_check;

alter table public.food_items
  add constraint food_items_menu_parts_for_type_check
  check (
    (item_type = 'main' and (menu_parts is null or array_length(menu_parts, 1) <= 3))
    or
    (item_type = 'menu' and array_length(menu_parts, 1) = 3)
  );
