export default function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  iconColor = 'accent',
  delta,
}) {
  const iconStyles = {
    accent:  { wrap: 'bg-food-accent-d', icon: 'text-food-accent' },
    green:   { wrap: 'bg-food-green-d',  icon: 'text-food-green'  },
    crimson: { wrap: 'bg-food-crimson-d', icon: 'text-food-crimson' },
  }
  const ic = iconStyles[iconColor] ?? iconStyles.accent

  return (
    <div className="bg-food-card border border-food-border rounded-xl p-5 shadow-card">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-food-text-s">{label}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ic.wrap}`}>
            <Icon className={`w-4 h-4 ${ic.icon}`} />
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-food-text">{value}</p>
      {sublabel && <p className="text-xs text-food-text-m mt-1">{sublabel}</p>}
      {delta && (
        <p className="text-xs text-food-green font-medium mt-2">{delta}</p>
      )}
    </div>
  )
}
