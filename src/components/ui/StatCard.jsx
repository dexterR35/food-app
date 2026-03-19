const ICON_COLORS = {
  accent:  'text-food-accent',
  green:   'text-food-green',
  crimson: 'text-food-crimson',
  orange:  'text-orange-400',
  blue:    'text-blue-400',
  amber:   'text-amber-500',
}

/* Hero metric card — matches body calc page hero card structure */
export default function StatCard({ label, value, sublabel, icon: Icon, iconColor = 'accent', highlight }) {
  const ic = ICON_COLORS[iconColor] ?? ICON_COLORS.accent

  return (
    <div className={`border rounded-2xl p-4 ${
      highlight
        ? 'bg-food-accent-d border-food-accent/30'
        : 'bg-food-card border-indigo-500/30'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-food-text-m text-[10px] font-bold uppercase tracking-wide">{label}</span>
        {Icon && <Icon className={`w-4 h-4 ${ic}`} />}
      </div>
      <p className={`text-2xl font-black leading-none ${highlight ? 'text-food-accent' : 'text-food-text'}`}>
        {value}
      </p>
      {sublabel && <p className="text-food-text-m text-[11px] mt-1.5">{sublabel}</p>}
    </div>
  )
}

/* Section card — matches body calc "Body Composition" / "Health Markers" card */
export function SectionCard({ title, icon: Icon, iconColor = 'text-food-accent', children }) {
  return (
    <div className="bg-food-card border border-food-border rounded-2xl p-5">
      <h3 className="text-food-text font-bold text-sm flex items-center gap-2 mb-1">
        {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
        {title}
      </h3>
      <div className="divide-y divide-food-border">{children}</div>
    </div>
  )
}

/* Row inside SectionCard */
export function StatRow({ label, value, sub, color }) {
  return (
    <div className="flex items-center justify-between py-2.5 last:pb-0 first:pt-0">
      <div>
        <p className="text-food-text-s text-xs font-medium">{label}</p>
        {sub && <p className="text-food-text-m text-[10px] mt-0.5">{sub}</p>}
      </div>
      <span className={`font-bold text-sm ${color ?? 'text-food-text'}`}>{value}</span>
    </div>
  )
}
