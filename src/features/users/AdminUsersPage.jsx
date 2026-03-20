import { useState } from 'react'
import { Check, X, MailPlus, Trash2, Copy } from 'lucide-react'
import { z } from 'zod'
import { useAllUsers, useUpdateUser, useInvitations, useInviteUser, useRevokeInvitation } from './hooks/useUsers'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { sanitizeEmail } from '../../utils/security'

const buildColumns = (onUpdate) => [
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

      </div>
    )
  },
]

export default function AdminUsersPage() {
  const [filter, setFilter] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const { data: users = [], isLoading } = useAllUsers()
  const { data: invitations = [], isLoading: invitationsLoading } = useInvitations()
  const update = useUpdateUser()
  const invite = useInviteUser()
  const revokeInvite = useRevokeInvitation()

  const pending = users.filter(u => u.status === 'pending')
  const filtered = users.filter(u =>
    !filter ||
    u.username?.toLowerCase().includes(filter.toLowerCase()) ||
    u.email?.toLowerCase().includes(filter.toLowerCase()) ||
    u.department?.toLowerCase().includes(filter.toLowerCase())
  )

  async function handleInvite(e) {
    e.preventDefault()
    const email = sanitizeEmail(inviteEmail)
    const valid = z.string().email().safeParse(email)
    if (!valid.success) return
    await invite.mutateAsync({ email })
    setInviteEmail('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-food-text">Users</h1>
          {pending.length > 0 && <p className="text-amber-400 text-sm mt-1">{pending.length} pending approval</p>}
        </div>
      </div>

      <div className="bg-food-card border border-food-border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MailPlus className="w-4 h-4 text-food-accent" />
          <h2 className="text-food-text font-semibold text-sm">Invite User</h2>
        </div>
        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            className="w-full max-w-sm bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors"
            placeholder="name@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(sanitizeEmail(e.target.value))}
            required
          />
          <Button type="submit" disabled={invite.isPending}>
            {invite.isPending ? 'Inviting…' : 'Send Invite'}
          </Button>
        </form>
        <p className="text-food-text-m text-xs">
          Sends an email invitation link. User sets password from the link and can then log in with role <span className="text-food-text">user</span>.
        </p>
      </div>

      <div className="bg-food-card border border-food-border rounded-lg p-4 space-y-2">
        <h3 className="text-food-text font-semibold text-sm">Invitations</h3>
        {invitationsLoading ? (
          <p className="text-food-text-m text-sm">Loading invitations…</p>
        ) : !invitations.length ? (
          <p className="text-food-text-m text-sm">No invitations yet.</p>
        ) : (
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between bg-food-elevated border border-food-border rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-food-text text-sm truncate">{inv.email}</p>
                  <p className="text-food-text-m text-xs">
                    {inv.accepted_at ? 'Accepted' : 'Pending'} · {new Date(inv.invited_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={inv.accepted_at ? 'approved' : 'pending'}>
                    {inv.accepted_at ? 'Accepted' : 'Pending'}
                  </Badge>
                  {!inv.accepted_at && (
                    <button
                      onClick={() => {
                        const link = `https://food-app-three-topaz.vercel.app/accept-invite?email=${encodeURIComponent(inv.email)}`
                        navigator.clipboard.writeText(link)
                      }}
                      className="text-food-text-s hover:text-food-accent"
                      title="Copy invite link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => revokeInvite.mutate(inv.id)}
                    className="text-red-400 hover:text-red-300"
                    title="Delete invitation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <input
        className="w-full max-w-xs bg-food-elevated border border-food-border rounded-lg px-3 py-2 text-food-text text-sm placeholder:text-food-text-m outline-none focus:border-food-accent transition-colors"
        placeholder="Search users…"
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      <DataTable columns={buildColumns(update.mutate)} data={filtered} loading={isLoading} emptyTitle="No users" />
    </div>
  )
}
