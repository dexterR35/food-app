import { useState, useMemo } from 'react'
import { Lock, CalendarDays, ShoppingCart, ChevronRight, Unlock } from 'lucide-react'
import { useBoard, useCreateBoard, useCloseBoard, useReopenBoard, useFoodItems } from './hooks/useBoard'
import { useMyOrder, useSubmitOrder } from './hooks/useSubmitOrder'
import { useCart } from './hooks/useCart'
import { useAuth } from '../../context/AuthContext'
import { useRealtime } from '../../hooks/useRealtime'
import FoodGrid from './components/FoodGrid'
import CartDrawer from './components/CartDrawer'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

export default function BoardPage() {
  const { isAdmin } = useAuth()
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')

  const { data: board, isLoading: boardLoading } = useBoard()
  const { data: foodItems = [], isLoading: foodLoading } = useFoodItems()
  const { data: existingOrder } = useMyOrder(board?.id)
  const cart = useCart(existingOrder?.order_items ?? [])
  const submitOrder = useSubmitOrder()
  const createBoard = useCreateBoard()
  const closeBoard = useCloseBoard()
  const reopenBoard = useReopenBoard()

  useRealtime({
    channel: `board-status-${board?.id}`,
    table: 'boards',
    filter: board?.id ? `id=eq.${board.id}` : null,
    queryKeys: [['board', 'today']],
  })

  const categories = useMemo(() => {
    const cats = [...new Set(foodItems.map(i => i.category).filter(Boolean))]
    return ['All', ...cats]
  }, [foodItems])

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return foodItems
    return foodItems.filter(i => i.category === activeCategory)
  }, [foodItems, activeCategory])

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
    <div className="space-y-0 -m-6">
      {/* Board header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-food-border bg-food-card">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-food-text">{board.title}</h1>
          <Badge variant={board.status}>{isClosed ? 'Closed' : 'Open'}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && !isClosed && (
            <Button variant="danger" size="sm" onClick={() => closeBoard.mutate(board.id)} disabled={closeBoard.isPending}>
              <Lock className="w-3.5 h-3.5" />
              {closeBoard.isPending ? 'Closing…' : 'Close Board'}
            </Button>
          )}
          {isAdmin && isClosed && (
            <Button size="sm" onClick={() => reopenBoard.mutate(board.id)} disabled={reopenBoard.isPending}>
              <Unlock className="w-3.5 h-3.5" />
              {reopenBoard.isPending ? 'Reopening…' : 'Reopen Board'}
            </Button>
          )}
        </div>
      </div>

      {isClosed ? (
        <div className="p-6">
          <div className="bg-food-card border border-food-border rounded-xl p-10 text-center">
            <Lock className="w-10 h-10 text-food-text-m mx-auto mb-3" />
            <p className="text-food-text font-semibold">Ordering is closed for today</p>
            {existingOrder && <p className="text-food-text-m text-sm mt-1">Your order has been submitted.</p>}
          </div>
        </div>
      ) : (
        <>
          {/* Category tabs */}
          <div className="flex items-center gap-1.5 px-6 py-3 bg-food-card border-b border-food-border overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center px-3.5 h-8 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-food-accent text-food-text-inv'
                    : 'bg-food-elevated text-food-text-s hover:text-food-text border border-food-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Food grid */}
          <div className="p-6 pb-24">
            <FoodGrid
              items={filteredItems}
              onAdd={cart.add}
              cartItemIds={cart.items.map(i => i.food_item_id)}
            />
          </div>

          {/* Floating cart pill */}
          {!cart.isEmpty && (
            <div className="fixed bottom-6 right-6 z-20">
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-3 px-5 h-12 rounded-full bg-food-accent hover:bg-food-accent-h text-food-text-inv font-semibold text-sm shadow-glow transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</span>
                <span className="h-4 w-px bg-white/30" />
                <span>{cart.totalPrice.toFixed(2)} RON</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
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
