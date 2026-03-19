import { useState, useMemo } from 'react'
import { Search, Download, ClipboardList, DollarSign, Flame, Users } from 'lucide-react'
import { useAllAdminOrders } from './hooks/useOrders'
import { adminAllOrderColumns } from './utils/orderColumns'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'
import { downloadCsv } from '../../utils/exportCsv'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useRealtime } from '../../hooks/useRealtime'
import { cn } from '../../utils/cn'

const RANGES = [
  { label: 'Today',      key: 'today'  },
  { label: 'This Week',  key: 'week'   },
  { label: 'This Month', key: 'month'  },
  { label: 'All Time',   key: 'all'    },
]

function startOf(range) {
  const d = new Date()
  if (range === 'today') { d.setHours(0, 0, 0, 0); return d }
  if (range === 'week')  { d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0); return d }
  if (range === 'month') { return new Date(d.getFullYear(), d.getMonth(), 1) }
  return null
}


export default function AdminOrdersPage() {
  const [range, setRange]   = useState('today')
  const [filter, setFilter] = useState('')

  const { data: allOrders = [], isLoading } = useAllAdminOrders()

  useRealtime({
    channel: 'admin-orders-all',
    table: 'orders',
    queryKeys: [['orders', 'all'], ['dashboard-stats']],
  })

  const rangeFiltered = useMemo(() => {
    const from = startOf(range)
    if (!from) return allOrders
    return allOrders.filter(o => o.submitted_at && new Date(o.submitted_at) >= from)
  }, [allOrders, range])

  const filtered = useMemo(() => {
    if (!filter) return rangeFiltered
    const q = filter.toLowerCase()
    return rangeFiltered.filter(o =>
      o.users?.username?.toLowerCase().includes(q) ||
      o.users?.department?.toLowerCase().includes(q) ||
      o.boards?.date?.includes(q)
    )
  }, [rangeFiltered, filter])

  const totalRevenue  = filtered.reduce((s, o) => s + Number(o.total_price), 0)
  const totalCalories = filtered.reduce((s, o) => s + o.total_calories, 0)
  const uniqueUsers   = new Set(filtered.map(o => o.user_id)).size

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">

      {/* Header */}
      <h1 className="text-2xl font-bold text-food-text">All Orders</h1>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Left — search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-food-text-m" />
          <input
            className="w-full bg-food-elevated border border-food-border rounded-xl pl-9 pr-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors"
            placeholder="Filter by user, department or date…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>

        {/* Right — range tabs + export */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex bg-food-elevated border border-food-border rounded-xl p-1 gap-1">
            {RANGES.map(r => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                  range === r.key
                    ? 'bg-food-accent text-white shadow-sm'
                    : 'text-food-text-s hover:text-food-text'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button onClick={() => downloadCsv(filtered, `orders-${range}`)} disabled={!filtered.length}>
            <Download className="w-4 h-4 mr-1 inline" />Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Orders"       value={filtered.length}                  icon={ClipboardList} iconColor="accent"  sublabel="total" />
        <StatCard label="Revenue"      value={`${totalRevenue.toFixed(2)} RON`} icon={DollarSign}   iconColor="green"   sublabel="collected" />
        <StatCard label="Calories"     value={`${totalCalories} kcal`}          icon={Flame}        iconColor="orange"  sublabel="ordered" />
        <StatCard label="Unique Users" value={uniqueUsers}                       icon={Users}        iconColor="accent"  sublabel="people" />
      </div>

      {/* Table */}
      <DataTable
        columns={adminAllOrderColumns}
        data={filtered}
        loading={isLoading}
        emptyTitle="No orders"
        emptyDescription={`No orders found for the selected period.`}
      />
    </div>
  )
}
