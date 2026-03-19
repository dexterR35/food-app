import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { sanitizeOrderPayload } from '../../../utils/security'

export function useSubmitOrder() {
  const queryClient = useQueryClient()
  const { profile } = useAuth()

  return useMutation({
    mutationFn: async ({ boardId, items, totalPrice, totalCalories, existingOrderId }) => {
      if (!profile?.id) {
        throw new Error('Authentication required.')
      }

      const safePayload = sanitizeOrderPayload({
        boardId,
        items,
        totalPrice,
        totalCalories,
        existingOrderId,
      })

      if (safePayload.existingOrderId) {
        // Edit: delete old items, re-insert, update totals
        const { error: delErr } = await supabase.from('order_items').delete().eq('order_id', safePayload.existingOrderId)
        if (delErr) throw delErr
        const { error: insErr } = await supabase.from('order_items').insert(
          safePayload.items.map((i) => ({
            order_id: safePayload.existingOrderId,
            food_item_id: i.food_item_id,
            quantity: i.quantity,
            unit_price: i.unit_price,
            unit_calories: i.unit_calories,
            note: i.note,
          }))
        )
        if (insErr) throw insErr
        const { error: updErr } = await supabase.from('orders')
          .update({
            total_price: safePayload.totalPrice,
            total_calories: safePayload.totalCalories,
            submitted_at: new Date().toISOString(),
          })
          .eq('id', safePayload.existingOrderId)
        if (updErr) throw updErr
        return safePayload.existingOrderId
      }
      // New order
      const { data: order, error: ordErr } = await supabase.from('orders')
        .insert({
          board_id: safePayload.boardId,
          user_id: profile.id,
          status: 'confirmed',
          total_price: safePayload.totalPrice,
          total_calories: safePayload.totalCalories,
          submitted_at: new Date().toISOString(),
        })
        .select().single()
      if (ordErr) throw ordErr
      const { error: itemsErr } = await supabase.from('order_items').insert(
        safePayload.items.map((i) => ({
          order_id: order.id,
          food_item_id: i.food_item_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          unit_calories: i.unit_calories,
          note: i.note,
        }))
      )
      if (itemsErr) throw itemsErr
      return order.id
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['my-order'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success(vars.existingOrderId ? 'Order updated!' : 'Order placed!')
    },
    onError: (e) => toast.error(`Order failed: ${e.message}`),
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
