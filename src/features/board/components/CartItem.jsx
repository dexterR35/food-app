import { Trash2, Minus, Plus, Flame } from 'lucide-react'

export default function CartItem({ item, onUpdateQty, onRemove }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-food-border">
      <div className="flex-1 min-w-0">
        <p className="text-food-text text-sm font-medium truncate">{item.name}</p>
        <p className="text-food-text-m text-xs flex items-center gap-1">
          {item.unit_price.toFixed(2)} RON · <Flame className="w-3 h-3" />{item.unit_calories} kcal
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onUpdateQty(item.food_item_id, item.quantity - 1)} className="w-6 h-6 rounded bg-food-elevated text-food-text-s flex items-center justify-center hover:bg-food-border transition-colors">
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-food-text text-sm w-6 text-center">{item.quantity}</span>
        <button onClick={() => onUpdateQty(item.food_item_id, item.quantity + 1)} className="w-6 h-6 rounded bg-food-elevated text-food-text-s flex items-center justify-center hover:bg-food-border transition-colors">
          <Plus className="w-3 h-3" />
        </button>
      </div>
      <button onClick={() => onRemove(item.food_item_id)} className="text-red-500 hover:text-red-400 transition-colors">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
