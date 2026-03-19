const variants = {
  open:      'bg-food-accent-d text-food-accent',
  closed:    'bg-gray-800 text-gray-400',
  pending:   'bg-amber-950 text-amber-400',
  approved:  'bg-food-accent-d text-food-accent',
  rejected:  'bg-red-950 text-red-400',
  confirmed: 'bg-blue-950 text-blue-400',
  cancelled: 'bg-gray-800 text-gray-500',
  admin:     'bg-purple-950 text-purple-400',
  user:      'bg-food-elevated text-food-text-m',
}

export default function Badge({ variant = 'pending', children }) {
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${variants[variant] ?? variants.pending}`}>
      {children}
    </span>
  )
}
