# FoodApp — Supabase API Patterns

Complete query reference. Copy-paste these patterns rather than writing from scratch —
they include the correct column selections and error handling.

## Table of Contents
1. [Auth](#auth)
2. [Users](#users)
3. [Food Items](#food-items)
4. [Boards](#boards)
5. [Orders](#orders)
6. [Order Items](#order-items)
7. [Realtime Channels](#realtime-channels)
8. [Storage (Avatars)](#storage)

---

## Auth

```js
// Sign in
supabase.auth.signInWithPassword({ email, password })

// Sign up (triggers handle_new_user() → inserts public.users with status='pending')
supabase.auth.signUp({ email, password })

// Sign out
supabase.auth.signOut()

// Listen for auth changes (use in AuthContext only)
supabase.auth.onAuthStateChange((event, session) => { ... })
```

---

## Users

```js
// Own profile
supabase.from('users').select('*').eq('id', userId).single()

// Update own profile
supabase.from('users')
  .update({ username, nickname, department, height_cm, weight_kg, age, gender, activity_level, goal })
  .eq('id', userId)

// [Admin] All users
supabase.from('users')
  .select('id, email, username, nickname, department, role, status, created_at, avatar_url')
  .order('created_at', { ascending: false })

// [Admin] Approve user
supabase.from('users').update({ status: 'approved' }).eq('id', userId)

// [Admin] Reject user
supabase.from('users').update({ status: 'rejected' }).eq('id', userId)

// [Admin] Change role
supabase.from('users').update({ role: 'admin' }).eq('id', userId) // or 'user'

// [Admin] Delete user
supabase.from('users').delete().eq('id', userId)
```

---

## Food Items

```js
// Active items for menu (all approved users)
supabase.from('food_items')
  .select('*')
  .eq('is_active', true)
  .order('category')

// [Admin] All items including inactive
supabase.from('food_items').select('*').order('category')

// [Admin] Create item
supabase.from('food_items').insert({
  name, description, price, calories,
  protein_g, carbs_g, fat_g,
  category, image_url, is_active: true
})

// [Admin] Update item
supabase.from('food_items').update({ name, price, calories, ... }).eq('id', id)

// [Admin] Soft delete (deactivate)
supabase.from('food_items').update({ is_active: false }).eq('id', id)
```

---

## Boards

```js
// Today's board (may return null)
const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD, local time
supabase.from('boards').select('*').eq('date', today).maybeSingle()

// [Admin] Create today's board
supabase.from('boards').insert({
  date: today,
  title: `Board ${today}`,
  status: 'open',
  created_by: adminUserId
}).select().single()

// [Admin] Close board
supabase.from('boards').update({ status: 'closed' }).eq('id', boardId)

// [Admin] All boards with creator info
supabase.from('boards')
  .select('*, users!created_by(username)')
  .order('date', { ascending: false })
```

---

## Orders

```js
// My order for today's board
supabase.from('orders')
  .select('*, order_items(*, food_items(name, image_url))')
  .eq('board_id', boardId)
  .eq('user_id', userId)
  .neq('status', 'cancelled')
  .maybeSingle()

// Submit new order (then insert order_items separately)
supabase.from('orders')
  .insert({ board_id, user_id, status: 'pending', total_price, total_calories, submitted_at: new Date().toISOString() })
  .select().single()

// Update order totals (after editing items)
supabase.from('orders')
  .update({ total_price, total_calories, submitted_at: new Date().toISOString() })
  .eq('id', orderId)

// Cancel order
supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId).eq('user_id', userId)

// [Admin] All orders for board with user + items
supabase.from('orders')
  .select('*, users(username, nickname, department, avatar_url), order_items(*, food_items(name, category))')
  .eq('board_id', boardId)
  .neq('status', 'cancelled')
  .order('submitted_at', { ascending: true })

// My order history
supabase.from('orders')
  .select('*, boards(date, title), order_items(*, food_items(name))')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50)
```

---

## Order Items

```js
// Insert items (always snapshot price + calories from food_items at this moment)
supabase.from('order_items').insert(
  cartItems.map(item => ({
    order_id: orderId,
    food_item_id: item.food_item_id,
    quantity: item.quantity,
    unit_price: item.unit_price,       // snapshot — NOT food_items.price
    unit_calories: item.unit_calories, // snapshot — NOT food_items.calories
    note: item.note || null
  }))
)

// Delete all items for an order (used when editing — delete + re-insert)
supabase.from('order_items').delete().eq('order_id', orderId)
```

**Why snapshot?** If admin changes a food item's price next week, historical orders should
show what the user actually paid, not today's price.

---

## Realtime Channels

Always use `useRealtime.js` wrapper. Raw channel code for reference:

```js
// Admin: watch all orders for today's board
const channel = supabase
  .channel('admin-orders-' + boardId)
  .on('postgres_changes', {
    event: '*', schema: 'public', table: 'orders',
    filter: `board_id=eq.${boardId}`
  }, () => queryClient.invalidateQueries({ queryKey: ['orders', boardId] }))
  .subscribe()
// cleanup: return () => supabase.removeChannel(channel)

// User: watch own order status
const channel = supabase
  .channel('user-order-' + userId)
  .on('postgres_changes', {
    event: '*', schema: 'public', table: 'orders',
    filter: `user_id=eq.${userId}`
  }, () => queryClient.invalidateQueries({ queryKey: ['my-order'] }))
  .subscribe()

// Board status (both admin and user)
const channel = supabase
  .channel('board-status-' + boardId)
  .on('postgres_changes', {
    event: 'UPDATE', schema: 'public', table: 'boards',
    filter: `id=eq.${boardId}`
  }, () => queryClient.invalidateQueries({ queryKey: ['board', 'today'] }))
  .subscribe()
```

**Prerequisite:** Realtime must be enabled per-table in Supabase Dashboard → Database →
Replication. Tables not listed there won't broadcast changes.

---

## Storage (Avatars)

```js
// Upload avatar (upsert = overwrite existing)
const path = `${userId}/avatar.${file.name.split('.').pop()}`
await supabase.storage.from('avatars').upload(path, file, { upsert: true })

// Get public URL (bucket is public-read)
const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

// Delete avatar
await supabase.storage.from('avatars').remove([path])
```

Storage path must always start with `${userId}/` — the storage RLS policy enforces this.
Uploads to other paths will fail with 403.
