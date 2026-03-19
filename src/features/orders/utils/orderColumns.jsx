import Badge from '../../../components/ui/Badge'
import { orderItemDisplayName } from '../../../utils/orderDisplay'

function formatBoardStatus(status) {
  if (status === 'open') return 'Open'
  if (status === 'closed') return 'Closed'
  return '—'
}

export const adminOrderColumns = [
  {
    header: 'User',
    accessorKey: 'users.username',
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-food-text text-sm">{row.original.users?.username}</div>
        <div className="text-food-text-m text-xs">{row.original.users?.department}</div>
      </div>
    )
  },
  {
    header: 'Items',
    id: 'items',
    cell: ({ row }) => (
      <div className="max-w-xs space-y-0.5">
        {row.original.order_items?.map((item, i) => (
          <div key={i} className="text-xs text-food-text-s">
            {orderItemDisplayName(item)} <span className="text-food-text-m">×{item.quantity}</span>
          </div>
        ))}
      </div>
    )
  },
  {
    header: 'Total',
    accessorKey: 'total_price',
    cell: ({ getValue }) => (
      <span className="text-food-accent font-bold">{Number(getValue()).toFixed(2)} <span className="text-food-text-m font-normal text-xs">RON</span></span>
    )
  },
  {
    header: 'Calories',
    accessorKey: 'total_calories',
    cell: ({ getValue }) => <span className="text-food-text-s text-sm">{getValue()} kcal</span>
  },
  {
    header: 'Time',
    accessorKey: 'submitted_at',
    cell: ({ getValue }) => getValue()
      ? <span className="text-food-text-m text-xs">{new Date(getValue()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      : '—'
  },
]

export const adminAllOrderColumns = [
  {
    header: 'Date',
    accessorKey: 'boards.date',
    cell: ({ row }) => (
      <div>
        <div className="text-food-text font-semibold text-sm">{row.original.boards?.date ?? '—'}</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-food-text-m text-xs">{row.original.boards?.title ?? 'Board'}</span>
          {row.original.boards?.status && (
            <Badge variant={row.original.boards.status}>
              {formatBoardStatus(row.original.boards.status)}
            </Badge>
          )}
        </div>
      </div>
    )
  },
  {
    header: 'User',
    accessorKey: 'users.username',
    cell: ({ row }) => (
      <div>
        <div className="font-semibold text-food-text text-sm">{row.original.users?.username}</div>
        <div className="text-food-text-m text-xs">{row.original.users?.department}</div>
      </div>
    )
  },
  {
    header: 'Items',
    id: 'items',
    cell: ({ row }) => (
      <div className="max-w-xs space-y-0.5">
        {row.original.order_items?.map((item, i) => (
          <div key={i} className="text-xs text-food-text-s">
            {orderItemDisplayName(item)} <span className="text-food-text-m">×{item.quantity}</span>
          </div>
        ))}
      </div>
    )
  },
  {
    header: 'Total',
    accessorKey: 'total_price',
    cell: ({ getValue }) => (
      <span className="text-food-accent font-bold">{Number(getValue()).toFixed(2)} <span className="text-food-text-m font-normal text-xs">RON</span></span>
    )
  },
  {
    header: 'Calories',
    accessorKey: 'total_calories',
    cell: ({ getValue }) => <span className="text-food-text-s text-sm">{getValue()} kcal</span>
  },
]

export const myOrderColumns = [
  {
    header: 'Date',
    accessorKey: 'boards.date',
    cell: ({ row }) => (
      <div>
        <div className="text-food-text font-semibold text-sm">{row.original.boards?.date ?? '—'}</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-food-text-m text-xs">{row.original.boards?.title ?? 'Board'}</span>
          {row.original.boards?.status && (
            <Badge variant={row.original.boards.status}>
              {formatBoardStatus(row.original.boards.status)}
            </Badge>
          )}
        </div>
      </div>
    )
  },
  {
    header: 'Items ordered',
    id: 'items',
    cell: ({ row }) => (
      <div className="space-y-0.5">
        {row.original.order_items?.map((item, i) => (
          <div key={i} className="text-xs text-food-text-s">
            {orderItemDisplayName(item)} <span className="text-food-text-m">×{item.quantity}</span>
          </div>
        ))}
      </div>
    )
  },
  {
    header: 'Total',
    accessorKey: 'total_price',
    cell: ({ getValue }) => (
      <span className="text-food-accent font-bold">{Number(getValue()).toFixed(2)} <span className="text-food-text-m font-normal text-xs">RON</span></span>
    )
  },
  {
    header: 'Calories',
    accessorKey: 'total_calories',
    cell: ({ getValue }) => <span className="text-food-text-s text-sm">{getValue()} kcal</span>
  },
  {
    header: 'Board',
    accessorKey: 'boards.status',
    cell: ({ row }) => (
      <Badge variant={row.original.boards?.status}>
        {formatBoardStatus(row.original.boards?.status)}
      </Badge>
    )
  },
]
