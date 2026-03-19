import { useState, useMemo } from 'react'
import { useMyOrders } from './hooks/useOrders'
import { myOrderColumns } from './utils/orderColumns'
import DataTable from '../../components/ui/DataTable'
import StatCard from '../../components/ui/StatCard'
import { ShoppingBag, Receipt, Flame } from 'lucide-react'
import { cn } from '../../utils/cn'

const RANGES = [
  { label: 'This Week',  key: 'week'  },
  { label: 'This Month', key: 'month' },
  { label: 'All Time',   key: 'all'   },
]

function startOf(range) {
  const d = new Date()
  if (range === 'week')  { d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0); return d }
  if (range === 'month') { return new Date(d.getFullYear(), d.getMonth(), 1) }
  return null
}

export default function MyOrdersPage() {
  const { data: allOrders = [], isLoading } = useMyOrders()
  const [range, setRange] = useState('all')

  const orders = useMemo(() => {
    const from = startOf(range)
    if (!from) return allOrders
    return allOrders.filter(o => o.submitted_at && new Date(o.submitted_at) >= from)
  }, [allOrders, range])

  const totalSpend    = orders.reduce((s, o) => s + Number(o.total_price), 0)
  const totalCalories = orders.reduce((s, o) => s + o.total_calories, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-food-text">My Orders</h1>

      {/* Range tabs */}
      <div className="flex bg-food-elevated border border-food-border rounded-xl p-1 gap-1 w-fit">
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

      {/* Summary cards */}
      {orders.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Orders"         value={orders.length}                     icon={ShoppingBag} iconColor="accent"  sublabel="total" />
          <StatCard label="Total Spent"    value={`${totalSpend.toFixed(2)} RON`}    icon={Receipt}     iconColor="green"   sublabel="all time" />
          <StatCard label="Total Calories" value={`${totalCalories} kcal`}           icon={Flame}       iconColor="orange"  sublabel="consumed" />
        </div>
      )}

      <DataTable
        columns={myOrderColumns}
        data={orders}
        loading={isLoading}
        emptyTitle="No orders yet"
        emptyDescription="Your order history will appear here."
      />
    </div>
  )
}
