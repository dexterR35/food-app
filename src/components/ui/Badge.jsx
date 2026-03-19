const styles = {
  open:      { bg: 'var(--s-open-bg)',      tx: 'var(--s-open-tx)'      },
  closed:    { bg: 'var(--s-closed-bg)',    tx: 'var(--s-closed-tx)'    },
  pending:   { bg: 'var(--s-pending-bg)',   tx: 'var(--s-pending-tx)'   },
  approved:  { bg: 'var(--s-approved-bg)',  tx: 'var(--s-approved-tx)'  },
  rejected:  { bg: 'var(--s-rejected-bg)',  tx: 'var(--s-rejected-tx)'  },
  confirmed: { bg: 'var(--s-confirmed-bg)', tx: 'var(--s-confirmed-tx)' },
  cancelled: { bg: 'var(--s-cancelled-bg)', tx: 'var(--s-cancelled-tx)' },
  admin:     { bg: 'var(--s-admin-bg)',     tx: 'var(--s-admin-tx)'     },
  user:      { bg: 'var(--s-user-bg)',      tx: 'var(--s-user-tx)'      },
}

export default function Badge({ variant = 'pending', children }) {
  const s = styles[variant] ?? styles.pending
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
      style={{ backgroundColor: s.bg, color: s.tx }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
      {children}
    </span>
  )
}
