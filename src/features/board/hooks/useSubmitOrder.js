import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'

export function useSubmitOrder() {
  const queryClient = useQueryClient()
  const { profile } = useAuth()

  return useMutation({
    mutationFn: async ({ boardId, items, totalPrice, totalCalories, existingOrderId }) => {
      if (existingOrderId) {
        // Edit: delete old items, re-insert, update totals
        const { error: delErr } = await supabase.from('order_items').delete().eq('order_id', existingOrderId)
        if (delErr) throw delErr
        const { error: insErr } = await supabase.from('order_items').insert(
          items.map(i => ({ order_id: existingOrderId, food_item_id: i.food_item_id, quantity: i.quantity, unit_price: i.unit_price, unit_calories: i.unit_calories, note: i.note }))
        )
        if (insErr) throw insErr
        const { error: updErr } = await supabase.from('orders')
          .update({ total_price: totalPrice, total_calories: totalCalories, submitted_at: new Date().toISOString() })
          .eq('id', existingOrderId)
        if (updErr) throw updErr
        return existingOrderId
      }
      // New order
      const { data: order, error: ordErr } = await supabase.from('orders')
        .insert({ board_id: boardId, user_id: profile.id, status: 'confirmed', total_price: totalPrice, total_calories: totalCalories, submitted_at: new Date().toISOString() })
        .select().single()
      if (ordErr) throw ordErr
      const { error: itemsErr } = await supabase.from('order_items').insert(
        items.map(i => ({ order_id: order.id, food_item_id: i.food_item_id, quantity: i.quantity, unit_price: i.unit_price, unit_calories: i.unit_calories, note: i.note }))
      )
      if (itemsErr) throw itemsErr
      return order.id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-order'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useMyOrder(boardId) {
  const { profile } = useAuth()
  return useQuery({
    queryKey: ['my-order', boardId],
    enabled: !!boardId && !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, food_items(name, image_url))')
        .eq('board_id', boardId)
        .eq('user_id', profile.id)
        .neq('status', 'cancelled')
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}
