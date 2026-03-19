import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'

export function useDashboardStats(boardId) {
  const { profile, isAdmin } = useAuth()

  const adminStats = useQuery({
    queryKey: ['dashboard-stats', 'admin', boardId],
    enabled: isAdmin && !!boardId,
    queryFn: async () => {
      // Today's board stats
      const { data: todayData, error: e1 } = await supabase
        .from('orders')
        .select('total_price, total_calories, user_id')
        .eq('board_id', boardId)
        .neq('status', 'cancelled')
      if (e1) throw e1

      // All-time totals
      const { data: allData, error: e2 } = await supabase
        .from('orders')
        .select('total_price, total_calories, board_id, user_id')
        .neq('status', 'cancelled')
      if (e2) throw e2

      const uniqueBoards    = new Set(allData.map(o => o.board_id)).size
      const uniqueAllUsers  = new Set(allData.map(o => o.user_id)).size
      const allTimeRevenue  = allData.reduce((s, o) => s + Number(o.total_price), 0)
      const allTimeOrders   = allData.length
      const allTimeCalories = allData.reduce((s, o) => s + o.total_calories, 0)

      return {
        totalOrders:     todayData.length,
        totalRevenue:    todayData.reduce((s, o) => s + Number(o.total_price), 0),
        totalCalories:   todayData.reduce((s, o) => s + o.total_calories, 0),
        uniqueUsers:     new Set(todayData.map(o => o.user_id)).size,
        allTimeRevenue,
        allTimeOrders,
        allTimeCalories,
        allTimeAvgOrder: allTimeOrders ? +(allTimeRevenue / allTimeOrders).toFixed(2) : 0,
        uniqueAllUsers,
        totalBoards:     uniqueBoards,
      }
    },
  })

  const userStats = useQuery({
    queryKey: ['dashboard-stats', 'user', boardId, profile?.id],
    enabled: !isAdmin && !!boardId && !!profile?.id,
    queryFn: async () => {
      // Today's order
      const { data: today, error: e1 } = await supabase
        .from('orders')
        .select('total_price, total_calories, order_items(quantity)')
        .eq('board_id', boardId)
        .eq('user_id', profile.id)
        .neq('status', 'cancelled')
        .maybeSingle()
      if (e1) throw e1

      // All-time user stats
      const { data: all, error: e2 } = await supabase
        .from('orders')
        .select('total_price, total_calories')
        .eq('user_id', profile.id)
        .neq('status', 'cancelled')
      if (e2) throw e2

      const allTimeSpend    = all.reduce((s, o) => s + Number(o.total_price), 0)
      const allTimeOrders   = all.length
      const allTimeCalories = all.reduce((s, o) => s + o.total_calories, 0)

      return {
        myItems:          today?.order_items?.reduce((s, i) => s + i.quantity, 0) ?? 0,
        mySpend:          today ? Number(today.total_price) : 0,
        myCalories:       today?.total_calories ?? 0,
        allTimeSpend,
        allTimeOrders,
        allTimeCalories,
        allTimeAvgSpend:  allTimeOrders ? +(allTimeSpend    / allTimeOrders).toFixed(2) : 0,
        allTimeAvgCal:    allTimeOrders ? Math.round(allTimeCalories / allTimeOrders)   : 0,
      }
    },
  })

  return isAdmin ? adminStats : userStats
}
