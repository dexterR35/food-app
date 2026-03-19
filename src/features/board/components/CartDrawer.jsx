import { X, ShoppingCart, Flame, CheckCircle, Receipt } from 'lucide-react'
import CartItem from './CartItem'
import EmptyState from '../../../components/ui/EmptyState'

export default function CartDrawer({ open, onClose, cart, onSubmit, submitting, existingOrder }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30" onClick={onClose} />}
      <aside className={`fixed right-0 top-0 h-full w-[420px] bg-food-card border-l border-food-border z-40 flex flex-col shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-food-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-food-accent-d flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-food-accent" />
            </div>
            <div>
              <h2 className="font-bold text-food-text text-sm">Your Order</h2>
              {!cart.isEmpty && (
                <p className="text-food-text-m text-xs">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-food-elevated text-food-text-m hover:text-food-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.isEmpty
            ? <EmptyState icon={ShoppingCart} title="Empty cart" description="Add items from the menu" />
            : cart.items.map(item => (
                <CartItem key={item.food_item_id} item={item} onUpdateQty={cart.updateQty} onRemove={cart.remove} />
              ))
          }
        </div>

        {/* Footer */}
        {!cart.isEmpty && (
          <div className="p-4 border-t border-food-border shrink-0 space-y-4 bg-food-card">
            {/* Totals */}
            <div className="bg-food-elevated rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-food-text-s flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  Total calories
                </span>
                <span className="font-semibold text-food-text">{cart.totalCalories} kcal</span>
              </div>
              <div className="h-px bg-food-border" />
              <div className="flex justify-between items-center">
                <span className="text-food-text-s text-sm flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-food-accent" />
                  Total
                </span>
                <span className="text-xl font-extrabold text-food-accent">{cart.totalPrice.toFixed(2)} <span className="text-xs font-semibold text-food-text-m">RON</span></span>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="w-full h-12 bg-food-accent hover:bg-food-accent-h text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-glow disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]"
            >
              <CheckCircle className="w-4 h-4" />
              {submitting ? 'Submitting…' : 'Place Order'}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
