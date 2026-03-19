import { Plus, Flame, Check } from 'lucide-react'

export default function FoodCard({ item, onAdd, inCart }) {
  return (
    <div
      className={`group relative bg-food-card rounded-2xl overflow-hidden cursor-pointer select-none
        transition-all duration-200 hover:-translate-y-1 hover:shadow-lg
        ${inCart
          ? 'ring-2 ring-food-accent shadow-glow'
          : 'border border-food-border hover:border-food-accent/60'
        }`}
      onClick={() => onAdd(item)}
    >
      {/* ── Image ─────────────────────────────────────── */}
      <div className="relative h-44 bg-food-elevated overflow-hidden">
        {item.image_url
          ? <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          : <div className="w-full h-full flex items-center justify-center text-6xl opacity-40">🍽</div>
        }

        {/* Category chip */}
        {item.category && (
          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest
            bg-black/55 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
            {item.category}
          </span>
        )}

        {/* In-cart check */}
        {inCart && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-food-accent rounded-full flex items-center justify-center shadow-md">
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
        )}

        {/* Calories chip — bottom-right overlay */}
        <span className="absolute bottom-2 right-2 flex items-center gap-1
          text-[10px] font-semibold text-white/90
          bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
          <Flame className="w-2.5 h-2.5 text-orange-400" />
          {item.calories}
        </span>

        {/* Gradient fade at bottom for readability */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* ── Body ──────────────────────────────────────── */}
      <div className="p-3.5">
        <h3 className="text-food-text font-bold text-sm leading-snug line-clamp-1">{item.name}</h3>
        {item.description && (
          <p className="text-food-text-m text-xs mt-0.5 line-clamp-1">{item.description}</p>
        )}

        <div className="flex items-center justify-between mt-3 gap-2">
          {/* Price — big and bold */}
          <div className="leading-none">
            <span className="text-food-accent font-extrabold text-xl">{item.price.toFixed(2)}</span>
            <span className="text-food-text-m text-[10px] font-semibold ml-0.5">RON</span>
          </div>

          {/* Add button */}
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(item) }}
            className={`shrink-0 flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-bold
              transition-all duration-150 active:scale-95
              ${inCart
                ? 'bg-food-accent-d text-food-accent border border-food-accent/40 hover:bg-food-accent hover:text-white'
                : 'bg-food-accent text-white hover:bg-food-accent-h'
              }`}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            {inCart ? 'More' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
