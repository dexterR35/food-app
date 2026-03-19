-- FoodApp — Schema
-- Run this first in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type user_role as enum ('admin', 'user');
create type user_status as enum ('pending', 'approved', 'rejected');
create type user_gender as enum ('male', 'female', 'other');
create type activity_level as enum ('sedentary', 'light', 'moderate', 'active', 'very_active');
create type body_goal as enum ('lose', 'maintain', 'gain');
create type board_status as enum ('open', 'closed');
create type order_status as enum ('pending', 'confirmed', 'cancelled');

-- Users (mirrors auth.users)
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  username      text unique,
  nickname      text,
  avatar_url    text,
  department    text,
  role          user_role not null default 'user',
  status        user_status not null default 'pending',
  -- Body calculator fields
  height_cm     integer,
  weight_kg     numeric(5,1),
  age           integer,
  gender        user_gender,
  activity_level activity_level,
  goal          body_goal,
  created_at    timestamptz not null default now()
);

-- Food items catalog
create table public.food_items (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  description   text,
  price         numeric(10,2) not null default 0,
  calories      integer not null default 0,
  protein_g     numeric(6,1) default 0,
  carbs_g       numeric(6,1) default 0,
  fat_g         numeric(6,1) default 0,
  category      text not null default 'Main',
  image_url     text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Daily boards
create table public.boards (
  id            uuid primary key default uuid_generate_v4(),
  date          date not null unique,   -- one board per day
  title         text not null,
  status        board_status not null default 'open',
  created_by    uuid not null references public.users(id),
  created_at    timestamptz not null default now()
);

-- Orders (one per user per board)
create table public.orders (
  id              uuid primary key default uuid_generate_v4(),
  board_id        uuid not null references public.boards(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  status          order_status not null default 'pending',
  total_price     numeric(10,2) not null default 0,
  total_calories  integer not null default 0,
  submitted_at    timestamptz,
  created_at      timestamptz not null default now(),
  unique(board_id, user_id)   -- one order per user per board
);

-- Order items (line items with snapshotted price/calories)
create table public.order_items (
  id             uuid primary key default uuid_generate_v4(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  food_item_id   uuid not null references public.food_items(id),
  quantity       integer not null default 1 check (quantity > 0),
  unit_price     numeric(10,2) not null,    -- snapshotted at order time
  unit_calories  integer not null,          -- snapshotted at order time
  note           text,
  created_at     timestamptz not null default now()
);

-- Indexes
create index idx_orders_board_id on public.orders(board_id);
create index idx_orders_user_id on public.orders(user_id);
create index idx_order_items_order_id on public.order_items(order_id);
create index idx_food_items_category on public.food_items(category);
create index idx_food_items_active on public.food_items(is_active);
create index idx_boards_date on public.boards(date);
