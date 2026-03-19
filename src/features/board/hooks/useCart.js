import { useState } from 'react'

/** Stable id for cart line: existing DB row, else catalog food id */
export function cartLineKey(item) {
  return item.lineId ?? item.food_item_id
}

export function useCart(existingOrderItems = []) {
  const [items, setItems] = useState(() =>
    existingOrderItems.map(i => ({
      lineId: i.id,
      food_item_id: i.food_item_id,
      name: i.food_items?.name ?? i.item_name ?? 'Removed item',
      unit_price: i.unit_price,
      unit_calories: i.unit_calories,
      quantity: i.quantity,
      note: i.note || '',
    }))
  )

  const add = (foodItem) =>
    setItems(prev => {
      const existing = prev.find(i => i.food_item_id === foodItem.id)
      if (existing) return prev.map(i => i.food_item_id === foodItem.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, {
        food_item_id: foodItem.id,
        name: foodItem.name,
        unit_price: foodItem.price,
        unit_calories: foodItem.calories,
        quantity: 1,
        note: '',
      }]
    })

  const remove = (lineKey) => setItems(prev => prev.filter(i => cartLineKey(i) !== lineKey))

  const updateQty = (lineKey, qty) => {
    if (qty <= 0) return remove(lineKey)
    setItems(prev => prev.map(i => (cartLineKey(i) === lineKey ? { ...i, quantity: qty } : i)))
  }

  const totalPrice = items.reduce((s, i) => s + i.unit_price * i.quantity, 0)
  const totalCalories = items.reduce((s, i) => s + i.unit_calories * i.quantity, 0)

  return { items, add, remove, updateQty, totalPrice, totalCalories, isEmpty: items.length === 0 }
}
