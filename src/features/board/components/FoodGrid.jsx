import FoodCard from './FoodCard'
import EmptyState from '../../../components/ui/EmptyState'
import { UtensilsCrossed } from 'lucide-react'

export default function FoodGrid({ items, onSelect, cartQtyById }) {
  if (!items.length) return (
    <EmptyState
      icon={UtensilsCrossed}
      title="No food items"
      description="Admin hasn't added any items yet."
    />
  )

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map(item => (
        <FoodCard
          key={item.id}
          item={item}
          onSelect={onSelect}
          quantityInCart={cartQtyById[item.id] ?? 0}
        />
      ))}
    </div>
  )
}
