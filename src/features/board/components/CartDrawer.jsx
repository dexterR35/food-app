import { X, ShoppingCart, Flame, CheckCircle } from 'lucide-react'
import CartItem from './CartItem'
import EmptyState from '../../../components/ui/EmptyState'

export default function CartDrawer({ open, onClose, cart, onSubmit, submitting, existingOrder }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30" onClick={onClose} />}
      <aside className={`fixed right-0 top-0 h-full w-96 bg-food-card border-l border-food-border z-40 flex flex-col shadow-lg transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-food-border shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-food-accent" />
            <h2 className="font-semibold text-food-text">Your Order</h2>
            {!cart.isEmpty && (
              <span className="w-5 h-5 rounded-full bg-food-accent text-food-text-inv text-[10px] font-bold flex items-center justify-center">
                {cart.items.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-food-elevated text-food-text-m hover:text-food-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.isEmpty
            ? <EmptyState icon={ShoppingCart} title="Empty cart" description="Add items from the menu" />
            : cart.items.map(item => (
                <CartItem key={item.food_item_id} item={item} onUpdateQty={cart.updateQty} onRemove={cart.remove} />
              ))
          }
        </div>

        {/* Footer */}
        {!cart.isEmpty && (
          <div className="p-4 border-t border-food-border shrink-0 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-food-text-s flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-food-crimson" />
                Total calories
              </span>
              <span className="font-semibold text-food-crimson">{cart.totalCalories} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-food-text">Total</span>
              <span className="text-lg font-bold text-food-accent">{cart.totalPrice.toFixed(2)} RON</span>
            </div>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="w-full h-11 bg-food-green hover:bg-food-green-h text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              {submitting ? 'Submitting…' : existingOrder ? 'Update Order' : 'Place Order'}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
