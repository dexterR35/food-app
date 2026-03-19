export default function StatCard({ label, value, sublabel, icon: Icon, accent = false }) {
  return (
    <div className="bg-food-card border border-food-border rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-food-text-s">{label}</span>
        {Icon && (
          <div className="p-2 bg-food-accent-d rounded-lg">
            <Icon className="w-4 h-4 text-food-accent" />
          </div>
        )}
      </div>
      <div className={`text-3xl font-bold ${accent ? 'text-food-accent' : 'text-food-text'}`}>{value}</div>
      {sublabel && <div className="text-xs text-food-text-m mt-1">{sublabel}</div>}
    </div>
  )
}
