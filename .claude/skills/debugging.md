---
name: debugging
description: Step-by-step debugging guide for common FoodApp issues
---

# FoodApp Debugging Guide

## Realtime Not Updating

1. Check: is the channel `filter` correct? (`board_id=eq.${boardId}` not `board_id=${boardId}`)
2. Check: is the subscription created before the data loads? (Race condition)
3. Check: is `supabase.removeChannel(channel)` called in `useEffect` cleanup?
4. Check: Supabase Realtime enabled for the table in Supabase Dashboard → Database → Replication?
5. Check browser console for `Realtime: error` messages.

## RLS Permission Denied

1. Run the query directly in Supabase SQL Editor with `set local role authenticated; set local "request.jwt.claims" to '{"sub":"<user-id>","role":"authenticated"}';`
2. Check which policy is blocking with: `select * from pg_policies where tablename = '<table>';`
3. Verify `is_admin()` / `is_approved()` functions exist and return correctly.
4. Common mistake: admin function queries `users` table but user doesn't exist → infinite loop. Check migration 007 pattern from `app-task`.

## Order Total Wrong

1. Check: are you using `unit_price`/`unit_calories` from `order_items` (not `food_items`)?
2. Recalculate: `sum(unit_price * quantity)` for all non-cancelled items.
3. Check if `orders.total_price` was updated after edit (the UPDATE call after DELETE/INSERT of items).

## Board Not Found for Today

1. Check timezone: `new Date().toISOString()` is UTC. Your server/DB may be in different TZ.
2. Fix: use `new Date().toLocaleDateString('en-CA')` for YYYY-MM-DD in local time, OR store board dates in UTC and compare in UTC consistently.
3. Check: board exists in DB? `select * from boards where date = 'YYYY-MM-DD';`

## User Stuck on Pending Screen

1. Check: did you run `003_triggers.sql`? The user row might not exist in `public.users`.
2. Check: `select * from public.users where email = '...'` in SQL Editor.
3. If row missing: `insert into public.users (id, email, username) select id, email, split_part(email,'@',1) from auth.users where email = '...';`
4. Then approve: `update public.users set status='approved' where email='...';`

## Avatar Not Loading

1. Check: Storage bucket `avatars` exists and is public.
2. Check: Storage policy allows public read.
3. Check: `avatar_url` stored is the full public URL, not just the path.
4. Get URL: `supabase.storage.from('avatars').getPublicUrl('${userId}/avatar.png').data.publicUrl`
