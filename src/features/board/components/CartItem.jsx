import { Trash2, Minus, Plus, Flame } from 'lucide-react'
import { useDebouncedAction } from '../../../hooks/useDebouncedAction'

export default function CartItem({ item, onUpdateQty, onRemove }) {
  const handleDecrease = useDebouncedAction(
    () => onUpdateQty(item.food_item_id, item.quantity - 1),
    180
  )
  const handleIncrease = useDebouncedAction(
    () => onUpdateQty(item.food_item_id, item.quantity + 1),
    180
  )
  const handleRemove = useDebouncedAction(() => onRemove(item.food_item_id), 180)

  return (
    <div className="flex items-center gap-3 bg-food-elevated rounded-xl p-3 border border-food-border">
      <div className="flex-1 min-w-0">
        <p className="text-food-text text-sm font-semibold truncate">{item.name}</p>
        <p className="text-food-text-m text-xs flex items-center gap-1 mt-0.5">
          <span className="text-food-accent font-bold">{item.unit_price.toFixed(2)} RON</span>
          <span className="text-food-text-m">·</span>
          <Flame className="w-3 h-3 text-orange-400" />
          <span>{item.unit_calories} kcal</span>
        </p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1.5 bg-food-card rounded-lg px-1.5 py-1 border border-food-border">
        <button
          onClick={handleDecrease}
          className="w-6 h-6 rounded-md bg-food-elevated hover:bg-food-border text-food-text-s hover:text-food-text flex items-center justify-center transition-colors"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-food-text text-sm font-bold w-5 text-center">{item.quantity}</span>
        <button
          onClick={handleIncrease}
          className="w-6 h-6 rounded-md bg-food-elevated hover:bg-food-border text-food-text-s hover:text-food-text flex items-center justify-center transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <button
        onClick={handleRemove}
        className="w-7 h-7 rounded-lg hover:bg-food-crimson-d text-food-text-m hover:text-food-crimson flex items-center justify-center transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
