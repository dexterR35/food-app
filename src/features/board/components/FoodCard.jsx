import { Plus, Flame } from 'lucide-react'

export default function FoodCard({ item, onAdd, inCart }) {
  return (
    <div className={`bg-food-card border rounded-xl overflow-hidden transition-colors ${inCart ? 'border-food-accent' : 'border-food-border hover:border-food-accent/50'}`}>
      <div className="h-32 bg-food-elevated overflow-hidden">
        {item.image_url
          ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">🍽</div>
        }
      </div>
      <div className="p-4">
        <span className="text-xs bg-food-accent-d text-food-accent px-2 py-0.5 rounded-full">{item.category}</span>
        <h3 className="text-food-text font-semibold text-sm mt-2 line-clamp-1">{item.name}</h3>
        {item.description && <p className="text-food-text-m text-xs mt-1 line-clamp-1">{item.description}</p>}
        <div className="flex items-center justify-between mt-3">
          <span className="text-food-accent font-bold text-sm">{item.price.toFixed(2)} RON</span>
          <span className="text-food-text-m text-xs flex items-center gap-1">
            <Flame className="w-3 h-3" />{item.calories}
          </span>
        </div>
        <button
          onClick={() => onAdd(item)}
          className="mt-3 w-full bg-food-accent hover:bg-food-accent-h text-white rounded-lg py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1"
        >
          <Plus className="w-3 h-3" />{inCart ? 'Add more' : 'Add to cart'}
        </button>
      </div>
    </div>
  )
}
