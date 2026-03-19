import FoodCard from './FoodCard'
import EmptyState from '../../../components/ui/EmptyState'
import { UtensilsCrossed } from 'lucide-react'

export default function FoodGrid({ items, onAdd, cartItemIds }) {
  const categories = [...new Set(items.map(i => i.category))]

  if (!items.length) return <EmptyState icon={UtensilsCrossed} title="No food items" description="Admin hasn't added any items yet." />

  return (
    <div className="space-y-6">
      {categories.map(cat => (
        <div key={cat}>
          <h3 className="text-food-text-s text-sm font-semibold mb-3 uppercase tracking-wide">{cat}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.filter(i => i.category === cat).map(item => (
              <FoodCard key={item.id} item={item} onAdd={onAdd} inCart={cartItemIds.includes(item.id)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
