import { useState, useEffect } from 'react'
import { ClipboardList, DollarSign, Flame, Search, Download, CalendarDays, TrendingUp, Lock, Unlock, Users, BarChart2 } from 'lucide-react'
import { useBoard, useCreateBoard, useCloseBoard, useReopenBoard, useAllBoards } from '../board/hooks/useBoard'
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
import Modal from '../../components/ui/Modal'
import DataTable from '../../components/ui/DataTable'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function DashboardPage() {
  const { isAdmin, profile } = useAuth()
  const { data: board, isLoading: boardLoading } = useBoard()
  const { data: stats, isLoading: statsLoading } = useDashboardStats(board?.id)
  const calc = useBodyCalc(profile)
  const createBoard = useCreateBoard()
  const closeBoard  = useCloseBoard()
  const reopenBoard = useReopenBoard()

  const { data: allBoards = [] } = useAllBoards()
  const [selectedBoardId, setSelectedBoardId] = useState(null)
  useEffect(() => {
    if (selectedBoardId === null && allBoards.length > 0) setSelectedBoardId(allBoards[0].id)
  }, [allBoards, selectedBoardId])

  const selectedBoard = allBoards.find(b => b.id === selectedBoardId) ?? null
  const { data: orders = [], isLoading: ordersLoading } = useAdminOrders(selectedBoardId)
  const [filter, setFilter] = useState('')
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false)
  const [reopenConfirmOpen, setReopenConfirmOpen] = useState(false)
  const formatBoardStatus = (status) => (status === 'open' ? 'Open' : status === 'closed' ? 'Closed' : status)

  async function handleConfirmCloseBoard() {
    if (!board?.id || closeBoard.isPending) return
    await closeBoard.mutateAsync(board.id)
    setCloseConfirmOpen(false)
  }

  async function handleConfirmReopenBoard() {
    if (!board?.id || reopenBoard.isPending) return
    await reopenBoard.mutateAsync(board.id)
    setReopenConfirmOpen(false)
  }

  useRealtime({
    channel: `dashboard-orders-${selectedBoardId}`,
    table: 'orders',
    filter: selectedBoardId ? `board_id=eq.${selectedBoardId}` : null,
    queryKeys: [['orders', selectedBoardId], ['dashboard-stats']],
  })

  if (boardLoading || statsLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-food-text">Dashboard</h1>
          <p className="text-food-text-m text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {board && <Badge variant={board.status}>{board.status === 'open' ? 'Board Open' : 'Board Closed'}</Badge>}
          {isAdmin && !board && (
            <Button onClick={() => createBoard.mutate()} disabled={createBoard.isPending}>
              Create Today's Board
            </Button>
          )}
          {isAdmin && board?.status === 'open' && (
            <Button variant="danger" size="sm" onClick={() => setCloseConfirmOpen(true)} disabled={closeBoard.isPending}>
              <Lock className="w-3.5 h-3.5" />
              {closeBoard.isPending ? 'Closing…' : 'Close Board'}
            </Button>
          )}
          {isAdmin && board?.status === 'closed' && (
            <Button size="sm" onClick={() => setReopenConfirmOpen(true)} disabled={reopenBoard.isPending}>
              <Unlock className="w-3.5 h-3.5" />
              {reopenBoard.isPending ? 'Reopening…' : 'Reopen Board'}
            </Button>
          )}
        </div>
      </div>

      {/* ── ADMIN ── */}
      {isAdmin && stats && (
        <>
          {/* Today */}
          <div>
            <p className="text-food-text-m text-xs font-bold uppercase tracking-widest mb-3">Today's Board</p>
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="Orders Today"   value={stats.totalOrders}                       icon={ClipboardList} iconColor="accent"  sublabel={`${stats.uniqueUsers} users`} />
              <StatCard label="Revenue Today"  value={`${stats.totalRevenue?.toFixed(2)} RON`} icon={DollarSign}   iconColor="green"   sublabel="collected" />
              <StatCard label="Calories Today" value={`${stats.totalCalories} kcal`}           icon={Flame}        iconColor="crimson" sublabel="ordered" />
              <StatCard label="Total Boards"   value={stats.totalBoards}                       icon={CalendarDays} iconColor="accent"  sublabel="days with orders" />
            </div>
          </div>

          {/* All-time */}
          <div>
            <p className="text-food-text-m text-xs font-bold uppercase tracking-widest mb-3">All Time</p>
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="Total Orders"    value={stats.allTimeOrders}                       icon={TrendingUp}  iconColor="accent"  sublabel="across all boards" />
              <StatCard label="Total Revenue"   value={`${stats.allTimeRevenue?.toFixed(2)} RON`} icon={DollarSign}  iconColor="green"   sublabel="all boards" />
              <StatCard label="Avg Order Value" value={`${stats.allTimeAvgOrder} RON`}            icon={BarChart2}   iconColor="amber"   sublabel="per order" />
              <StatCard label="Unique Users"    value={stats.uniqueAllUsers}                      icon={Users}       iconColor="accent"  sublabel="ever ordered" />
            </div>
          </div>
        </>
      )}

      {/* ── USER ── */}
      {!isAdmin && stats && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Items Today" value={stats.myItems}                      icon={ClipboardList} iconColor="accent"  sublabel="ordered today" />
            <StatCard label="Spent Today" value={`${stats.mySpend?.toFixed(2)} RON`} icon={DollarSign}   iconColor="green"   sublabel="today" />
            <StatCard label="Calories"    value={`${stats.myCalories} kcal`}         icon={Flame}        iconColor="crimson" sublabel="consumed today" />
          </div>

          {/* Calorie progress */}
          {calc && (
            <div className="bg-food-card border border-food-border rounded-xl p-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-food-text-s flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  Calorie progress today
                </span>
                <span className="text-food-text font-semibold">{stats.myCalories} / {calc.dailyTarget} kcal</span>
              </div>
              <div className="w-full h-2.5 bg-food-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-food-accent rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((stats.myCalories / calc.dailyTarget) * 100, 100)}%` }}
                />
              </div>
              <p className="text-food-text-m text-xs">
                {Math.max(calc.dailyTarget - stats.myCalories, 0)} kcal remaining toward your <span className="text-food-accent font-semibold">{profile?.goal}</span> goal
              </p>
            </div>
          )}

          {/* All-time user stats */}
          <div>
            <p className="text-food-text-m text-xs font-bold uppercase tracking-widest mb-3">All Time</p>
            <div className="grid grid-cols-5 gap-4">
              <StatCard label="Total Orders"    value={stats.allTimeOrders}                     icon={ClipboardList} iconColor="accent"  sublabel="all boards" />
              <StatCard label="Total Spent"     value={`${stats.allTimeSpend?.toFixed(2)} RON`} icon={DollarSign}   iconColor="green"   sublabel="all time" />
              <StatCard label="Total Calories"  value={`${stats.allTimeCalories} kcal`}         icon={Flame}        iconColor="crimson" sublabel="all time" />
              <StatCard label="Avg per Order"   value={`${stats.allTimeAvgSpend} RON`}          icon={BarChart2}    iconColor="amber"   sublabel="average spend" />
              <StatCard label="Avg Calories"    value={`${stats.allTimeAvgCal} kcal`}           icon={Flame}        iconColor="orange"  sublabel="per order" />
            </div>
          </div>
        </>
      )}

      {/* No stats */}
      {!stats && (
        <div className="bg-food-card border border-food-border rounded-xl p-8 text-center">
          <p className="text-food-text-m">{board ? 'No orders yet today.' : 'No board created yet today.'}</p>
        </div>
      )}

      {/* ── Admin orders table ── */}
      {isAdmin && (
        <div className="space-y-4">
          <div>
            {/* Title */}
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-food-text">Orders</h2>
              {selectedBoard && <Badge variant={selectedBoard.status}>{formatBoardStatus(selectedBoard.status)}</Badge>}
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
              {/* Left — search */}
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-food-text-m" />
                <input
                  className="w-full bg-food-elevated border border-food-border rounded-xl pl-9 pr-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors"
                  placeholder="Filter by user or department…"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                />
              </div>

              {/* Right — day select + export */}
              <div className="ml-auto flex items-center gap-3">
                <select
                  className="bg-food-elevated border border-food-border rounded-xl px-3 py-2 text-food-text text-sm outline-none focus:border-food-accent"
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
            emptyDescription="Orders appear here in real-time when users submit."
          />
        </div>
      )}

      <Modal
        open={closeConfirmOpen}
        onClose={() => !closeBoard.isPending && setCloseConfirmOpen(false)}
        title="Close today's board?"
        size="sm"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-food-border bg-food-elevated p-3">
            <p className="text-food-text text-sm font-semibold">Warning</p>
            <p className="mt-1 text-food-text-m text-xs">
              Closing the board stops users from submitting new orders. You can reopen it later if needed.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setCloseConfirmOpen(false)}
              disabled={closeBoard.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCloseBoard}
              disabled={closeBoard.isPending}
            >
              {closeBoard.isPending ? 'Closing…' : 'Yes, close board'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={reopenConfirmOpen}
        onClose={() => !reopenBoard.isPending && setReopenConfirmOpen(false)}
        title="Reopen today's board?"
        size="sm"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-food-border bg-food-elevated p-3">
            <p className="text-food-text text-sm font-semibold">Confirmation</p>
            <p className="mt-1 text-food-text-m text-xs">
              Reopening the board allows users to submit and update orders again.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setReopenConfirmOpen(false)}
              disabled={reopenBoard.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmReopenBoard} disabled={reopenBoard.isPending}>
              {reopenBoard.isPending ? 'Reopening…' : 'Yes, reopen board'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
