import { useState } from 'react'
import { Check, X, Trash2, Shield, User } from 'lucide-react'
import { useAllUsers, useUpdateUser, useDeleteUser } from './hooks/useUsers'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

const buildColumns = (onUpdate, onDelete) => [
  {
    header: 'User', id: 'user',
    cell: ({ row: { original: u } }) => (
      <div className="flex items-center gap-2">
        {u.avatar_url
          ? <img src={u.avatar_url} className="w-8 h-8 rounded-full object-cover" />
          : <div className="w-8 h-8 rounded-full bg-food-accent-d flex items-center justify-center text-food-accent text-sm font-semibold">{u.username?.[0]?.toUpperCase()}</div>
        }
        <div>
          <div className="text-food-text font-medium">{u.username}</div>
          <div className="text-food-text-m text-xs">{u.email}</div>
        </div>
      </div>
    )
  },
  { header: 'Department', accessorKey: 'department', cell: ({ getValue }) => getValue() ?? '—' },
  { header: 'Role', accessorKey: 'role', cell: ({ getValue }) => <Badge variant={getValue()}>{getValue()}</Badge> },
  { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <Badge variant={getValue()}>{getValue()}</Badge> },
  {
    header: 'Actions', id: 'actions',
    cell: ({ row: { original: u } }) => (
      <div className="flex gap-2">
        {u.status === 'pending' && <>
          <button onClick={() => onUpdate({ id: u.id, status: 'approved' })} title="Approve" className="text-food-accent hover:text-food-accent-h"><Check className="w-4 h-4" /></button>
          <button onClick={() => onUpdate({ id: u.id, status: 'rejected' })} title="Reject" className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
        </>}
        <button onClick={() => onUpdate({ id: u.id, role: u.role === 'admin' ? 'user' : 'admin' })} title="Toggle role" className="text-food-text-s hover:text-food-accent">
          {u.role === 'admin' ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
        </button>
        <button onClick={() => { if (confirm(`Delete ${u.username}?`)) onDelete(u.id) }} className="text-red-500 hover:text-red-400">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )
  },
]

export default function AdminUsersPage() {
  const [filter, setFilter] = useState('')
  const { data: users = [], isLoading } = useAllUsers()
  const update = useUpdateUser()
  const del = useDeleteUser()

  const pending = users.filter(u => u.status === 'pending')
  const filtered = users.filter(u =>
    !filter ||
    u.username?.toLowerCase().includes(filter.toLowerCase()) ||
    u.email?.toLowerCase().includes(filter.toLowerCase()) ||
    u.department?.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-food-text">Users</h1>
          {pending.length > 0 && <p className="text-amber-400 text-sm mt-1">{pending.length} pending approval</p>}
        </div>
      </div>
      <input
        className="w-full max-w-xs bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors"
        placeholder="Search users…"
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      <DataTable columns={buildColumns(update.mutate, del.mutate)} data={filtered} loading={isLoading} emptyTitle="No users" />
    </div>
  )
}
