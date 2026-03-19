import { cn } from '../../utils/cn'

const variants = {
  primary:   'bg-food-accent hover:bg-food-accent-h text-food-text-inv',
  secondary: 'border border-food-border hover:border-food-border-h text-food-text-s hover:text-food-text bg-transparent hover:bg-food-elevated',
  danger:    'bg-food-crimson-d hover:bg-food-crimson/20 text-food-crimson border border-food-crimson/30',
  success:   'bg-food-green-d hover:bg-food-green/20 text-food-green border border-food-green/30',
  ghost:     'text-food-text-m hover:text-food-text hover:bg-food-elevated',
  link:      'text-food-accent hover:text-food-accent-h underline-offset-2 hover:underline p-0 h-auto',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold',
        'transition-colors duration-150',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
