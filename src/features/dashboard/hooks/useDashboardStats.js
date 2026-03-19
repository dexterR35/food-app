import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'

export function useDashboardStats(boardId) {
  const { profile, isAdmin } = useAuth()

  const adminStats = useQuery({
    queryKey: ['dashboard-stats', 'admin', boardId],
    enabled: isAdmin && !!boardId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('total_price, total_calories, status, user_id')
        .eq('board_id', boardId)
        .neq('status', 'cancelled')
      if (error) throw error
      return {
        totalOrders: data.length,
        totalRevenue: data.reduce((s, o) => s + Number(o.total_price), 0),
        totalCalories: data.reduce((s, o) => s + o.total_calories, 0),
        pendingOrders: data.filter(o => o.status === 'pending').length,
      }
    },
  })

  const userStats = useQuery({
    queryKey: ['dashboard-stats', 'user', boardId, profile?.id],
    enabled: !isAdmin && !!boardId && !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('total_price, total_calories, order_items(quantity)')
        .eq('board_id', boardId)
        .eq('user_id', profile.id)
        .neq('status', 'cancelled')
        .maybeSingle()
      if (error) throw error
      return {
        myItems: data?.order_items?.reduce((s, i) => s + i.quantity, 0) ?? 0,
        mySpend: data ? Number(data.total_price) : 0,
        myCalories: data?.total_calories ?? 0,
      }
    },
  })

  return isAdmin ? adminStats : userStats
}
