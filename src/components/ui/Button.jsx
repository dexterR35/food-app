import { cn } from '../../utils/cn'

const variants = {
  primary:   'bg-food-accent hover:bg-food-accent-h text-white',
  secondary: 'border border-food-border hover:border-food-accent text-food-text-s hover:text-food-text',
  danger:    'bg-red-950 hover:bg-red-900 text-red-400',
  ghost:     'text-food-text-m hover:text-food-text hover:bg-food-elevated',
}

export default function Button({ variant = 'primary', className, children, ...props }) {
  return (
    <button
      className={cn('rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed', variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}
