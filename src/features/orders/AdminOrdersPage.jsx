import { useState } from 'react'
import { Search, Download } from 'lucide-react'
import { useBoard } from '../board/hooks/useBoard'
import { useAdminOrders } from './hooks/useOrders'
import { adminOrderColumns } from './utils/orderColumns'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { downloadCsv } from '../../utils/exportCsv'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useRealtime } from '../../hooks/useRealtime'

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState('')
  const { data: board, isLoading: boardLoading } = useBoard()
  const { data: orders = [], isLoading } = useAdminOrders(board?.id)

  useRealtime({
    channel: `admin-orders-${board?.id}`,
    table: 'orders',
    filter: board?.id ? `board_id=eq.${board.id}` : null,
    queryKeys: [['orders', board?.id], ['dashboard-stats']],
  })

  if (boardLoading || isLoading) return <LoadingSpinner />

  const today = new Date().toLocaleDateString('en-CA')
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_price), 0)
  const totalCalories = orders.reduce((s, o) => s + o.total_calories, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-food-text">All Orders</h1>
          {board && <div className="flex items-center gap-2 mt-1"><Badge variant={board.status}>{board.status}</Badge><span className="text-food-text-m text-sm">{board.date}</span></div>}
        </div>
        <Button onClick={() => downloadCsv(orders, today)} disabled={!orders.length}>
          <Download className="w-4 h-4 mr-1 inline" />Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-food-card border border-food-border rounded-xl p-4">
          <div className="text-food-text-m text-xs mb-1">Total Orders</div>
          <div className="text-2xl font-bold text-food-text">{orders.length}</div>
        </div>
        <div className="bg-food-card border border-food-border rounded-xl p-4">
          <div className="text-food-text-m text-xs mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-food-accent">{totalRevenue.toFixed(2)} RON</div>
        </div>
        <div className="bg-food-card border border-food-border rounded-xl p-4">
          <div className="text-food-text-m text-xs mb-1">Total Calories</div>
          <div className="text-2xl font-bold text-food-text">{totalCalories} kcal</div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-food-text-m" />
        <input
          className="w-full bg-food-elevated border border-food-border rounded-lg pl-9 pr-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors"
          placeholder="Filter by username or department…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      <DataTable
        columns={adminOrderColumns}
        data={orders.filter(o =>
          !filter ||
          o.users?.username?.toLowerCase().includes(filter.toLowerCase()) ||
          o.users?.department?.toLowerCase().includes(filter.toLowerCase())
        )}
        emptyTitle="No orders yet"
        emptyDescription="Orders will appear here in real-time when users submit."
      />
    </div>
  )
}
