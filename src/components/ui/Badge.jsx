import { cn } from '../../utils/cn'

const styles = {
  open:      { bg: 'var(--s-open-bg)',      tx: 'var(--s-open-tx)' },
  closed:    { bg: 'var(--s-closed-bg)',    tx: 'var(--s-closed-tx)' },
  pending:   { bg: 'var(--s-pending-bg)',   tx: 'var(--s-pending-tx)' },
  approved:  { bg: 'var(--s-approved-bg)',  tx: 'var(--s-approved-tx)' },
  rejected:  { bg: 'var(--s-rejected-bg)',  tx: 'var(--s-rejected-tx)' },
  confirmed: { bg: 'var(--s-confirmed-bg)', tx: 'var(--s-confirmed-tx)' },
  cancelled: { bg: 'var(--s-cancelled-bg)', tx: 'var(--s-cancelled-tx)' },
  admin:     { bg: 'var(--s-admin-bg)',     tx: 'var(--s-admin-tx)' },
  user:      { bg: 'var(--s-user-bg)',      tx: 'var(--s-user-tx)' },
  success:   { bg: 'var(--s-approved-bg)',  tx: 'var(--s-approved-tx)' },
  danger:    { bg: 'var(--s-rejected-bg)',  tx: 'var(--s-rejected-tx)' },
  warning:   { bg: 'var(--s-pending-bg)',   tx: 'var(--s-pending-tx)' },
  info:      { bg: 'var(--s-confirmed-bg)', tx: 'var(--s-confirmed-tx)' },
  neutral:   { bg: 'var(--s-user-bg)',      tx: 'var(--s-user-tx)' },
}

const aliases = {
  active: 'approved',
  ready: 'approved',
  inactive: 'cancelled',
}

const sizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
}

export default function Badge({ variant = 'pending', size = 'md', className, children }) {
  const normalizedVariant = aliases[variant] ?? variant
  const s = styles[normalizedVariant] ?? styles.pending
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wide',
        sizes[size] ?? sizes.md,
        className
      )}
      style={{ backgroundColor: s.bg, color: s.tx }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
      {children}
    </span>
  )
}
