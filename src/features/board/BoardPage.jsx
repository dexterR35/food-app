import { useState } from 'react'
import { Lock, CalendarDays, ShoppingCart } from 'lucide-react'
import { useBoard, useCreateBoard, useCloseBoard, useFoodItems } from './hooks/useBoard'
import { useMyOrder, useSubmitOrder } from './hooks/useSubmitOrder'
import { useCart } from './hooks/useCart'
import { useAuth } from '../../context/AuthContext'
import FoodGrid from './components/FoodGrid'
import CartDrawer from './components/CartDrawer'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

export default function BoardPage() {
  const { isAdmin } = useAuth()
  const [cartOpen, setCartOpen] = useState(false)
  const { data: board, isLoading: boardLoading } = useBoard()
  const { data: foodItems = [], isLoading: foodLoading } = useFoodItems()
  const { data: existingOrder } = useMyOrder(board?.id)
  const cart = useCart(existingOrder?.order_items ?? [])
  const submitOrder = useSubmitOrder()
  const createBoard = useCreateBoard()
  const closeBoard = useCloseBoard()

  async function handleSubmit() {
    if (cart.isEmpty) return
    await submitOrder.mutateAsync({
      boardId: board.id,
      items: cart.items,
      totalPrice: cart.totalPrice,
      totalCalories: cart.totalCalories,
      existingOrderId: existingOrder?.id,
    })
    setCartOpen(false)
  }

  if (boardLoading || foodLoading) return <LoadingSpinner />

  if (!board) return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-food-text">Today's Board</h1>
      <EmptyState
        icon={CalendarDays}
        title="No board today"
        description={isAdmin ? "Create today's board to open ordering." : "Admin hasn't created today's board yet."}
        action={isAdmin && (
          <Button onClick={() => createBoard.mutate()} disabled={createBoard.isPending}>
            {createBoard.isPending ? 'Creating…' : "Create Today's Board"}
          </Button>
        )}
      />
    </div>
  )

  const isClosed = board.status === 'closed'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-food-text">{board.title}</h1>
          <Badge variant={board.status}>{isClosed ? 'Closed' : 'Open'}</Badge>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && !isClosed && (
            <Button variant="danger" onClick={() => closeBoard.mutate(board.id)} disabled={closeBoard.isPending}>
              <Lock className="w-4 h-4 mr-1 inline" />Close Board
            </Button>
          )}
          {!isClosed && (
            <Button onClick={() => setCartOpen(true)} className="relative">
              <ShoppingCart className="w-4 h-4 mr-1 inline" />
              Cart {!cart.isEmpty && <span className="ml-1 bg-white text-food-accent text-xs rounded-full px-1.5">{cart.items.length}</span>}
            </Button>
          )}
        </div>
      </div>

      {isClosed ? (
        <div className="bg-food-card border border-food-border rounded-xl p-8 text-center">
          <Lock className="w-10 h-10 text-food-text-m mx-auto mb-3" />
          <p className="text-food-text font-semibold">Ordering is closed for today</p>
          {existingOrder && <p className="text-food-text-m text-sm mt-1">Your order has been submitted.</p>}
        </div>
      ) : (
        <FoodGrid items={foodItems} onAdd={cart.add} cartItemIds={cart.items.map(i => i.food_item_id)} />
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onSubmit={handleSubmit}
        submitting={submitOrder.isPending}
        existingOrder={existingOrder}
      />
    </div>
  )
}
