import { useMyOrders } from './hooks/useOrders'
import { myOrderColumns } from './utils/orderColumns'
import DataTable from '../../components/ui/DataTable'

export default function MyOrdersPage() {
  const { data: orders = [], isLoading } = useMyOrders()

  const totalSpend = orders.reduce((s, o) => s + Number(o.total_price), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-food-text">My Orders</h1>
        <span className="text-food-text-s text-sm">Total spend: <span className="text-food-accent font-semibold">{totalSpend.toFixed(2)} RON</span></span>
      </div>
      <DataTable
        columns={myOrderColumns}
        data={orders}
        loading={isLoading}
        emptyTitle="No orders yet"
        emptyDescription="Your orders will appear here after you submit on Today's Board."
      />
    </div>
  )
}
