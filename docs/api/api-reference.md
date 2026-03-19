# FoodApp — API Reference (Supabase)

All data access is through the Supabase JS client. No custom REST API.
Base client: `src/lib/supabase.js`

---

## Auth

### Sign Up
```js
supabase.auth.signUp({ email, password })
// Triggers: create_user_on_signup() → inserts into public.users with status='pending'
```

### Sign In
```js
supabase.auth.signInWithPassword({ email, password })
```

### Sign Out
```js
supabase.auth.signOut()
```

### Get Session
```js
supabase.auth.getSession()
supabase.auth.onAuthStateChange((event, session) => {})
```

---

## Users

### Get Own Profile
```js
supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()
```

### Update Own Profile
```js
supabase
  .from('users')
  .update({ username, nickname, department, height_cm, weight_kg, age, gender, activity_level, goal })
  .eq('id', userId)
```

### Upload Avatar
```js
supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file, { upsert: true })

supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.png`)
```

### [Admin] List All Users
```js
supabase
  .from('users')
  .select('id, email, username, nickname, department, role, status, created_at, avatar_url')
  .order('created_at', { ascending: false })
```

### [Admin] Approve / Reject User
```js
supabase
  .from('users')
  .update({ status: 'approved' }) // or 'rejected'
  .eq('id', userId)
```

### [Admin] Change User Role
```js
supabase
  .from('users')
  .update({ role: 'admin' }) // or 'user'
  .eq('id', userId)
```

### [Admin] Delete User
```js
// Delete from public.users (cascade handles related data per RLS)
supabase
  .from('users')
  .delete()
  .eq('id', userId)
```

---

## Food Items

### List Active Food Items (all users)
```js
supabase
  .from('food_items')
  .select('*')
  .eq('is_active', true)
  .order('category', { ascending: true })
```

### [Admin] List All Food Items
```js
supabase
  .from('food_items')
  .select('*')
  .order('category')
```

### [Admin] Create Food Item
```js
supabase
  .from('food_items')
  .insert({ name, description, price, calories, protein_g, carbs_g, fat_g, category, image_url, is_active: true })
```

### [Admin] Update Food Item
```js
supabase
  .from('food_items')
  .update({ name, description, price, calories, protein_g, carbs_g, fat_g, category, image_url, is_active })
  .eq('id', foodItemId)
```

### [Admin] Soft Delete Food Item
```js
supabase
  .from('food_items')
  .update({ is_active: false })
  .eq('id', foodItemId)
```

---

## Boards

### Get Today's Board
```js
supabase
  .from('boards')
  .select('*')
  .eq('date', new Date().toISOString().split('T')[0]) // YYYY-MM-DD
  .single()
```

### [Admin] Create Today's Board
```js
supabase
  .from('boards')
  .insert({
    date: new Date().toISOString().split('T')[0],
    title: `Board ${formattedDate}`,
    status: 'open',
    created_by: adminUserId
  })
```

### [Admin] Close Board
```js
supabase
  .from('boards')
  .update({ status: 'closed' })
  .eq('id', boardId)
```

### [Admin] List All Boards
```js
supabase
  .from('boards')
  .select('*, users!created_by(username)')
  .order('date', { ascending: false })
```

---

## Orders

### Get My Order for Today
```js
supabase
  .from('orders')
  .select(`
    *,
    order_items(*, food_items(name, image_url))
  `)
  .eq('user_id', userId)
  .eq('board_id', boardId)
  .single()
```

### Submit Order
```js
// 1. Insert order
const { data: order } = await supabase
  .from('orders')
  .insert({ board_id, user_id, status: 'pending', total_price, total_calories })
  .select()
  .single()

// 2. Insert order items (price/calories snapshotted from food_items)
await supabase
  .from('order_items')
  .insert(
    cartItems.map(item => ({
      order_id: order.id,
      food_item_id: item.food_item_id,
      quantity: item.quantity,
      unit_price: item.food_items.price,      // snapshot
      unit_calories: item.food_items.calories, // snapshot
      note: item.note
    }))
  )
```

### Update Order (while board open)
```js
// Delete existing items
await supabase.from('order_items').delete().eq('order_id', orderId)
// Re-insert updated items + update order totals
await supabase.from('order_items').insert(updatedItems)
await supabase.from('orders').update({ total_price, total_calories }).eq('id', orderId)
```

### Cancel Order
```js
supabase
  .from('orders')
  .update({ status: 'cancelled' })
  .eq('id', orderId)
  .eq('user_id', userId) // RLS also enforces this
```

### [Admin] Get All Orders for Today
```js
supabase
  .from('orders')
  .select(`
    *,
    users(username, nickname, department, avatar_url),
    order_items(*, food_items(name, category))
  `)
  .eq('board_id', boardId)
  .neq('status', 'cancelled')
  .order('submitted_at', { ascending: true })
```

### [Admin] Filter Orders by User
```js
supabase
  .from('orders')
  .select('*, users(username, department), order_items(*)')
  .eq('board_id', boardId)
  .ilike('users.username', `%${searchTerm}%`)
```

### My Order History
```js
supabase
  .from('orders')
  .select(`
    *,
    boards(date, title),
    order_items(*, food_items(name))
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50)
```

---

## Realtime Channels

### Admin: Watch Today's Orders
```js
const channel = supabase
  .channel('admin-orders')
  .on('postgres_changes', {
    event: '*', schema: 'public', table: 'orders',
    filter: `board_id=eq.${boardId}`
  }, () => queryClient.invalidateQueries(['orders', boardId]))
  .subscribe()

return () => supabase.removeChannel(channel) // cleanup
```

### User: Watch Own Order
```js
const channel = supabase
  .channel(`user-order-${userId}`)
  .on('postgres_changes', {
    event: '*', schema: 'public', table: 'orders',
    filter: `user_id=eq.${userId}`
  }, () => queryClient.invalidateQueries(['my-order', boardId]))
  .subscribe()
```

### Board Status
```js
const channel = supabase
  .channel('board-status')
  .on('postgres_changes', {
    event: 'UPDATE', schema: 'public', table: 'boards',
    filter: `id=eq.${boardId}`
  }, () => queryClient.invalidateQueries(['board', 'today']))
  .subscribe()
```
