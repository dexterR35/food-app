export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon className="w-12 h-12 text-food-border mb-4" />}
      <h3 className="text-food-text font-semibold mb-1">{title}</h3>
      {description && <p className="text-food-text-m text-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}
