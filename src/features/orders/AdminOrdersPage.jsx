import { useState, useEffect } from 'react'
import { Search, Download } from 'lucide-react'
import { useBoard, useAllBoards } from '../board/hooks/useBoard'
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
  const [selectedBoardId, setSelectedBoardId] = useState(null)
  const { data: todayBoard } = useBoard()
  const { data: allBoards = [], isLoading: boardsLoading } = useAllBoards()
  const board = allBoards.find(b => b.id === selectedBoardId) ?? null
  const { data: orders = [], isLoading } = useAdminOrders(selectedBoardId)

  useEffect(() => {
    if (selectedBoardId === null && allBoards.length > 0) {
      setSelectedBoardId(allBoards[0].id)
    }
  }, [allBoards, selectedBoardId])

  useRealtime({
    channel: `admin-orders-${selectedBoardId}`,
    table: 'orders',
    filter: selectedBoardId ? `board_id=eq.${selectedBoardId}` : null,
    queryKeys: [['orders', selectedBoardId], ['dashboard-stats']],
  })

  if (boardsLoading) return <LoadingSpinner />

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_price), 0)
  const totalCalories = orders.reduce((s, o) => s + o.total_calories, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-food-text">All Orders</h1>
          {board && <Badge variant={board.status}>{board.status}</Badge>}
        </div>
        <div className="flex items-center gap-3">
          <select
            className="bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm outline-none focus:border-food-accent"
            value={selectedBoardId ?? ''}
            onChange={e => setSelectedBoardId(e.target.value)}
          >
            {allBoards.map(b => (
              <option key={b.id} value={b.id}>
                {b.date}{b.id === todayBoard?.id ? ' (today)' : ''}
              </option>
            ))}
          </select>
          <Button onClick={() => downloadCsv(orders, board?.date ?? 'export')} disabled={!orders.length}>
            <Download className="w-4 h-4 mr-1 inline" />Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-food-card border border-food-border rounded-xl p-5">
          <div className="text-food-text-m text-xs font-medium mb-1">Total Orders</div>
          <div className="text-2xl font-semibold text-food-text">{orders.length}</div>
        </div>
        <div className="bg-food-card border border-food-border rounded-xl p-5">
          <div className="text-food-text-m text-xs font-medium mb-1">Total Revenue</div>
          <div className="text-2xl font-semibold text-food-accent">{totalRevenue.toFixed(2)} RON</div>
        </div>
        <div className="bg-food-card border border-food-border rounded-xl p-5">
          <div className="text-food-text-m text-xs font-medium mb-1">Total Calories</div>
          <div className="text-2xl font-semibold text-food-text">{totalCalories} kcal</div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-food-text-m" />
        <input
          className="w-full bg-food-elevated border border-food-border rounded-lg pl-9 pr-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent"
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
