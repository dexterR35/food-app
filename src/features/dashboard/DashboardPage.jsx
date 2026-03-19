import { ClipboardList, DollarSign, Flame, Clock } from 'lucide-react'
import { useBoard, useCreateBoard } from '../board/hooks/useBoard'
import { useDashboardStats } from './hooks/useDashboardStats'
import { useAuth } from '../../context/AuthContext'
import { useBodyCalc } from '../../hooks/useBodyCalc'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function DashboardPage() {
  const { isAdmin, profile } = useAuth()
  const { data: board, isLoading: boardLoading } = useBoard()
  const { data: stats, isLoading: statsLoading } = useDashboardStats(board?.id)
  const calc = useBodyCalc(profile)
  const createBoard = useCreateBoard()

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value={stats.totalOrders} icon={ClipboardList} sublabel="today" />
          <StatCard label="Revenue" value={`${stats.totalRevenue?.toFixed(2)} RON`} icon={DollarSign} accent sublabel="today" />
          <StatCard label="Total Calories" value={`${stats.totalCalories} kcal`} icon={Flame} sublabel="ordered today" />
          <StatCard label="Pending" value={stats.pendingOrders} icon={Clock} sublabel="orders" />
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Items Ordered" value={stats.myItems} icon={ClipboardList} sublabel="today" />
            <StatCard label="My Spend" value={`${stats.mySpend?.toFixed(2)} RON`} icon={DollarSign} accent sublabel="today" />
            <StatCard label="My Calories" value={`${stats.myCalories} kcal`} icon={Flame} sublabel="today" />
          </div>
          {/* Calorie progress bar */}
          {calc && (
            <div className="bg-food-card border border-food-border rounded-xl p-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-food-text-s flex items-center gap-1"><Flame className="w-3 h-3 text-food-accent" />Calories today</span>
                <span className="text-food-text">{stats.myCalories} / {calc.dailyTarget} kcal</span>
              </div>
              <div className="w-full h-2 bg-food-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-food-accent rounded-full transition-all"
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
        <div className="bg-food-card border border-food-border rounded-xl p-8 text-center">
          <p className="text-food-text-m">{board ? 'No orders yet today.' : 'No board created yet today.'}</p>
        </div>
      )}
    </div>
  )
}
