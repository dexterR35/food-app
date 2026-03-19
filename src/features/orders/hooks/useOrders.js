import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'

export function useAdminOrders(boardId) {
  return useQuery({
    queryKey: ['orders', boardId],
    enabled: !!boardId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, users(username, nickname, department, avatar_url), order_items(*, food_items(name, category))')
        .eq('board_id', boardId)
        .neq('status', 'cancelled')
        .order('submitted_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useMyOrders() {
  const { profile } = useAuth()
  return useQuery({
    queryKey: ['my-orders'],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, boards(date, title), order_items(*, food_items(name))')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data
    },
  })
}
