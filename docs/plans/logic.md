# FoodApp — Business Logic

## Board Logic

### One Board Per Day
- `boards.date` has a `UNIQUE` constraint.
- Before creating, check: `select count(*) from boards where date = today`. If > 0, disable "Create Board" button.
- Date is always stored as `YYYY-MM-DD` in UTC. Frontend normalizes with `new Date().toISOString().split('T')[0]`.

### Open / Close
- Admin opens: `status = 'open'` (default on create)
- Admin closes: `UPDATE boards SET status = 'closed' WHERE id = boardId`
- RLS on `orders` and `order_items` checks `boards.status = 'open'` for write operations.
- Frontend additionally disables submit/edit UI when board is `closed` (real-time subscription detects change).

---

## Order Logic

### Cart (Frontend State)
```js
// Cart item shape
{ food_item_id, name, quantity, unit_price, unit_calories, note }

// Totals (computed from cart)
total_price = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
total_calories = cart.reduce((sum, item) => sum + item.unit_calories * item.quantity, 0)
```

Cart is local state (`useState`). It is NOT persisted (if user refreshes, cart clears). If user has an existing order, cart is pre-populated from `order_items`.

### Submit Order
1. Validate: cart must have at least 1 item.
2. Check board is still `open` (Zod + RLS will also enforce).
3. `INSERT INTO orders (board_id, user_id, status='pending', total_price, total_calories)`
4. `INSERT INTO order_items` — each item with **snapshotted** `unit_price` and `unit_calories` from current `food_items` row.
5. On success: clear cart, show success toast, refetch order.

### Edit Order (while board open)
1. Load existing order into cart.
2. User modifies cart.
3. On save:
   - `DELETE FROM order_items WHERE order_id = orderId`
   - `INSERT INTO order_items` new items
   - `UPDATE orders SET total_price, total_calories WHERE id = orderId`

### Cancel Order
- `UPDATE orders SET status = 'cancelled' WHERE id = orderId AND user_id = userId`
- Order remains in DB (soft cancel) for audit. Admin can see cancelled orders filtered out by default.

### Price/Calorie Snapshot
**Critical:** `unit_price` and `unit_calories` in `order_items` are copied from `food_items` at the moment of submit. If admin later changes a food item's price or calories, historical orders are unaffected.

---

## Body Calculator Logic

### BMR (Mifflin-St Jeor Formula)
```js
// Male
bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
// Female
bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
// Other — use average
bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 78
```

### TDEE (Total Daily Energy Expenditure)
```js
const multipliers = {
  sedentary:   1.2,   // desk job, no exercise
  light:       1.375, // light exercise 1-3x/week
  moderate:    1.55,  // moderate exercise 3-5x/week
  active:      1.725, // hard exercise 6-7x/week
  very_active: 1.9    // physical job + hard training
}
tdee = bmr * multipliers[activity_level]
```

### Daily Calorie Target
```js
const adjustments = {
  lose:     -500,  // ~0.5kg/week loss
  maintain: 0,
  gain:     +300   // lean gain
}
dailyTarget = Math.round(tdee + adjustments[goal])
```

### Macro Split (default balanced)
```js
protein_g = Math.round((dailyTarget * 0.30) / 4)  // 30% protein, 4 kcal/g
fat_g     = Math.round((dailyTarget * 0.25) / 9)  // 25% fat, 9 kcal/g
carbs_g   = Math.round((dailyTarget * 0.45) / 4)  // 45% carbs, 4 kcal/g
```

### Calorie Progress (today)
```js
consumedToday = sum of (order_items.unit_calories * order_items.quantity)
                for all orders by this user today with status != 'cancelled'
remaining = dailyTarget - consumedToday
progressPercent = Math.min((consumedToday / dailyTarget) * 100, 100)
```

---

## CSV Export Logic

```js
// src/utils/exportCsv.js
export function exportOrdersCsv(orders, date) {
  const rows = []
  for (const order of orders) {
    for (const item of order.order_items) {
      rows.push({
        date,
        username: order.users.username,
        department: order.users.department,
        food_item: item.food_items.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        unit_calories: item.unit_calories,
        line_total_price: item.unit_price * item.quantity,
        line_total_calories: item.unit_calories * item.quantity,
        order_total_price: order.total_price,
        order_total_calories: order.total_calories,
        note: item.note || '',
        submitted_at: order.submitted_at
      })
    }
  }
  // Convert to CSV string and trigger download
  const csv = [Object.keys(rows[0]).join(','), ...rows.map(r => Object.values(r).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `orders-${date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
```

---

## User Approval Flow

```
User registers
  → Supabase creates auth.users row
  → DB trigger inserts public.users { status: 'pending', role: 'user' }
  → User sees PendingPage (polls or realtime for status change)

Admin opens /users
  → Sees pending users at top (badge count in sidebar)
  → Clicks Approve → UPDATE users SET status='approved'
  → User's session refreshes AuthContext → redirected to Dashboard

Admin clicks Reject → UPDATE users SET status='rejected'
  → User sees RejectedPage
```

---

## Realtime Subscription Strategy

### Admin Dashboard
Subscribe when admin lands on `/` or `/orders`:
- `orders:board_id=eq.{todayBoardId}` — new/updated orders
- `order_items:*` (via join, invalidate parent query)

### User Board Page
Subscribe when user opens `/board`:
- `orders:user_id=eq.{userId}&board_id=eq.{todayBoardId}` — own order updates
- `boards:id=eq.{boardId}` — detect close event (lock UI immediately)

### Pending User Count (Admin sidebar badge)
Subscribe:
- `users:status=eq.pending` — detect new registrations

All subscriptions: created in `useEffect`, cleaned up on unmount.
