import { useState, useEffect } from 'react'
import { ClipboardList, DollarSign, Flame, Search, Download } from 'lucide-react'
import { useBoard, useCreateBoard, useAllBoards } from '../board/hooks/useBoard'
import { useDashboardStats } from './hooks/useDashboardStats'
import { useAdminOrders } from '../orders/hooks/useOrders'
import { adminOrderColumns } from '../orders/utils/orderColumns'
import { useAuth } from '../../context/AuthContext'
import { useBodyCalc } from '../../hooks/useBodyCalc'
import { useRealtime } from '../../hooks/useRealtime'
import { downloadCsv } from '../../utils/exportCsv'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import DataTable from '../../components/ui/DataTable'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function DashboardPage() {
  const { isAdmin, profile } = useAuth()
  const { data: board, isLoading: boardLoading } = useBoard()
  const { data: stats, isLoading: statsLoading } = useDashboardStats(board?.id)
  const calc = useBodyCalc(profile)
  const createBoard = useCreateBoard()

  // Admin: board selector for orders table
  const { data: allBoards = [] } = useAllBoards()
  const [selectedBoardId, setSelectedBoardId] = useState(null)
  useEffect(() => {
    if (selectedBoardId === null && allBoards.length > 0) {
      setSelectedBoardId(allBoards[0].id)
    }
  }, [allBoards, selectedBoardId])
  const selectedBoard = allBoards.find(b => b.id === selectedBoardId) ?? null
  const { data: orders = [], isLoading: ordersLoading } = useAdminOrders(selectedBoardId)
  const [filter, setFilter] = useState('')

  useRealtime({
    channel: `dashboard-orders-${selectedBoardId}`,
    table: 'orders',
    filter: selectedBoardId ? `board_id=eq.${selectedBoardId}` : null,
    queryKeys: [['orders', selectedBoardId], ['dashboard-stats']],
  })

  if (boardLoading || statsLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-food-text">Dashboard</h1>
          <p className="text-food-text-m text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        {board
          ? <div className="flex items-center gap-2"><Badge variant={board.status}>{board.status === 'open' ? 'Board Open' : 'Board Closed'}</Badge></div>
          : isAdmin && <Button onClick={() => createBoard.mutate()} disabled={createBoard.isPending}>Create Today's Board</Button>
        }
      </div>

      {isAdmin && stats ? (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Orders"   value={stats.totalOrders}                        icon={ClipboardList} iconColor="accent"  sublabel="today" />
          <StatCard label="Revenue"        value={`${stats.totalRevenue?.toFixed(2)} RON`}  icon={DollarSign}   iconColor="green"   sublabel="today" />
          <StatCard label="Total Calories" value={`${stats.totalCalories} kcal`}            icon={Flame}        iconColor="crimson" sublabel="ordered today" />
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Items Ordered" value={stats.myItems}                             icon={ClipboardList} iconColor="accent"  sublabel="today" />
            <StatCard label="My Spend"      value={`${stats.mySpend?.toFixed(2)} RON`}        icon={DollarSign}   iconColor="green"   sublabel="today" />
            <StatCard label="My Calories"   value={`${stats.myCalories} kcal`}               icon={Flame}        iconColor="crimson" sublabel="today" />
          </div>
          {calc && (
            <div className="bg-food-card border border-food-border rounded-xl p-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-food-text-s flex items-center gap-1"><Flame className="w-3 h-3 text-food-accent" />Calories today</span>
                <span className="text-food-text">{stats.myCalories} / {calc.dailyTarget} kcal</span>
              </div>
              <div className="w-full h-2 bg-food-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-food-accent rounded-full"
                  style={{ width: `${Math.min((stats.myCalories / calc.dailyTarget) * 100, 100)}%` }}
                />
              </div>
              <p className="text-food-text-m text-xs mt-1">
                {Math.max(calc.dailyTarget - stats.myCalories, 0)} kcal remaining toward your {profile?.goal} goal
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-food-card border border-food-border rounded-xl p-6 text-center">
          <p className="text-food-text-m">{board ? 'No orders yet today.' : 'No board created yet today.'}</p>
        </div>
      )}

      {isAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-food-text">Orders</h2>
              {selectedBoard && <Badge variant={selectedBoard.status}>{selectedBoard.status}</Badge>}
            </div>
            <div className="flex items-center gap-3">
              <select
                className="bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm outline-none focus:border-food-accent"
                value={selectedBoardId ?? ''}
                onChange={e => setSelectedBoardId(e.target.value)}
              >
                {allBoards.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.date}{b.id === board?.id ? ' (today)' : ''}
                  </option>
                ))}
              </select>
              <Button onClick={() => downloadCsv(orders, selectedBoard?.date ?? 'export')} disabled={!orders.length}>
                <Download className="w-4 h-4 mr-1 inline" />Export CSV
              </Button>
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
            loading={ordersLoading}
            emptyTitle="No orders yet"
            emptyDescription="Orders will appear here in real-time when users submit."
          />
        </div>
      )}
    </div>
  )
}
