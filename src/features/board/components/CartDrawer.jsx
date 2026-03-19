import { X, ShoppingCart, Flame } from 'lucide-react'
import CartItem from './CartItem'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'

export default function CartDrawer({ open, onClose, cart, onSubmit, submitting, existingOrder }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30" onClick={onClose} />}
      <div className={`fixed right-0 top-0 h-full w-80 bg-food-card border-l border-food-border z-40 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-food-border">
          <h2 className="text-food-text font-semibold">Your Cart</h2>
          <button onClick={onClose} className="text-food-text-m hover:text-food-text"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {cart.isEmpty
            ? <EmptyState icon={ShoppingCart} title="Empty cart" description="Add items from the menu" />
            : cart.items.map(item => (
                <CartItem key={item.food_item_id} item={item} onUpdateQty={cart.updateQty} onRemove={cart.remove} />
              ))
          }
        </div>
        {!cart.isEmpty && (
          <div className="p-5 border-t border-food-border space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-food-text-s">Total</span>
              <span className="text-food-accent font-bold">{cart.totalPrice.toFixed(2)} RON</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-food-text-s flex items-center gap-1"><Flame className="w-3 h-3" />Calories</span>
              <span className="text-food-text">{cart.totalCalories} kcal</span>
            </div>
            <Button className="w-full" onClick={onSubmit} disabled={submitting}>
              {submitting ? 'Submitting…' : existingOrder ? 'Update order' : 'Submit order'}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
