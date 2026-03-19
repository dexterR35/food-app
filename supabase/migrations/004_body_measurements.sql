-- Body measurement columns for detailed body composition analysis
-- Run in Supabase SQL Editor after 003_triggers.sql

alter table public.users
  add column if not exists neck_cm   numeric(5,1),   -- US Navy body fat formula
  add column if not exists waist_cm  numeric(5,1),   -- WHR, WHtR, body fat
  add column if not exists hip_cm    numeric(5,1),   -- WHR, female body fat formula
  add column if not exists wrist_cm  numeric(4,1);   -- frame size classification
