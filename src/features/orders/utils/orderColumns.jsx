import Badge from '../../../components/ui/Badge'

export const adminOrderColumns = [
  {
    header: 'User',
    accessorKey: 'users.username',
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-food-text">{row.original.users?.username}</div>
        <div className="text-food-text-m text-xs">{row.original.users?.department}</div>
      </div>
    )
  },
  {
    header: 'Items',
    id: 'items',
    cell: ({ row }) => (
      <div className="max-w-xs">
        {row.original.order_items?.map((item, i) => (
          <span key={i} className="text-xs text-food-text-s">
            {item.food_items?.name} ×{item.quantity}{i < row.original.order_items.length - 1 ? ', ' : ''}
          </span>
        ))}
      </div>
    )
  },
  {
    header: 'Total (RON)',
    accessorKey: 'total_price',
    cell: ({ getValue }) => <span className="text-food-accent font-semibold">{Number(getValue()).toFixed(2)}</span>
  },
  {
    header: 'Calories',
    accessorKey: 'total_calories',
    cell: ({ getValue }) => <span className="text-food-text-s">{getValue()} kcal</span>
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ getValue }) => <Badge variant={getValue()}>{getValue()}</Badge>
  },
  {
    header: 'Submitted',
    accessorKey: 'submitted_at',
    cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleTimeString() : '—'
  },
]

export const myOrderColumns = [
  {
    header: 'Date',
    accessorKey: 'boards.date',
    cell: ({ row }) => row.original.boards?.date ?? '—'
  },
  {
    header: 'Board',
    accessorKey: 'boards.title',
    cell: ({ row }) => row.original.boards?.title ?? '—'
  },
  {
    header: 'Items',
    id: 'items',
    cell: ({ row }) => (
      <span className="text-xs text-food-text-s">
        {row.original.order_items?.map(i => `${i.food_items?.name} ×${i.quantity}`).join(', ')}
      </span>
    )
  },
  {
    header: 'Total (RON)',
    accessorKey: 'total_price',
    cell: ({ getValue }) => <span className="text-food-accent font-semibold">{Number(getValue()).toFixed(2)}</span>
  },
  {
    header: 'Calories',
    accessorKey: 'total_calories',
    cell: ({ getValue }) => <span className="text-food-text-s">{getValue()} kcal</span>
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ getValue }) => <Badge variant={getValue()}>{getValue()}</Badge>
  },
]
