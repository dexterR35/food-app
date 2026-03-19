import { useState, useMemo } from 'react'
import { Lock, CalendarDays, ShoppingCart, ChevronRight } from 'lucide-react'
import { useBoard, useCreateBoard, useFoodItems } from './hooks/useBoard'
import { useMyOrder, useSubmitOrder } from './hooks/useSubmitOrder'
import { useCart } from './hooks/useCart'
import { useAuth } from '../../context/AuthContext'
import { useRealtime } from '../../hooks/useRealtime'
import FoodGrid from './components/FoodGrid'
import CartDrawer from './components/CartDrawer'
import OrderSuccessModal from './components/OrderSuccessModal'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { useDebouncedAction } from '../../hooks/useDebouncedAction'

export default function BoardPage() {
  const { isAdmin } = useAuth()
  const [cartOpen, setCartOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedFood, setSelectedFood] = useState(null)

  const { data: board, isLoading: boardLoading } = useBoard()
  const { data: foodItems = [], isLoading: foodLoading } = useFoodItems()
  const { data: existingOrder } = useMyOrder(board?.id)
  const cart = useCart(existingOrder?.order_items ?? [])
  const submitOrder = useSubmitOrder()
  const createBoard = useCreateBoard()

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
  const cartQtyById = useMemo(
    () => Object.fromEntries(
      cart.items.filter((i) => i.food_item_id).map((i) => [i.food_item_id, i.quantity])
    ),
    [cart.items]
  )

  async function handleSubmit() {
    if (cart.isEmpty || submitOrder.isPending || !board?.id || board.status === 'closed') return
    await submitOrder.mutateAsync({
      boardId: board.id,
      items: cart.items,
      totalPrice: cart.totalPrice,
      totalCalories: cart.totalCalories,
      existingOrderId: existingOrder?.id,
    })
    setCartOpen(false)
    setSuccessOpen(true)
  }

  const handleSubmitDebounced = useDebouncedAction(handleSubmit, 700)
  const handleCreateBoardDebounced = useDebouncedAction(() => createBoard.mutate(), 700)
  const handleConfirmAddDebounced = useDebouncedAction(() => {
    if (!selectedFood) return
    cart.add(selectedFood)
    setSelectedFood(null)
  }, 350)

  if (boardLoading || foodLoading) return <LoadingSpinner />

  if (!board) return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-food-text">Today's Board</h1>
      <EmptyState
        icon={CalendarDays}
        title="No board today"
        description={isAdmin ? "Create today's board to open ordering." : "Admin hasn't created today's board yet."}
        action={isAdmin && (
          <Button onClick={handleCreateBoardDebounced} disabled={createBoard.isPending}>
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
        <div />
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
          {/* Category only: individual (Main) and menu (3 pcs) items both live in their category */}
          <div className="flex items-center gap-1.5 px-6 py-3 bg-food-card border-b border-food-border overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
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
              onSelect={setSelectedFood}
              cartQtyById={cartQtyById}
            />
          </div>

          {/* Floating cart pill */}
          {!cart.isEmpty && (
            <div className="fixed bottom-6 right-6 z-20">
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-3 px-5 h-13 rounded-full bg-food-accent hover:bg-food-accent-h text-food-text-inv font-bold text-sm shadow-glow transition-all duration-150 hover:scale-105 active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-extrabold">{cart.items.length}</span>
                  item{cart.items.length !== 1 ? 's' : ''}
                </span>
                <span className="h-4 w-px bg-white/30" />
                <span className="font-extrabold">{cart.totalPrice.toFixed(2)} <span className="font-semibold opacity-80 text-xs">RON</span></span>
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
        onSubmit={handleSubmitDebounced}
        submitting={submitOrder.isPending}
        existingOrder={existingOrder}
      />

      <Modal
        open={!!selectedFood}
        onClose={() => setSelectedFood(null)}
        title="Add item to cart?"
        size="sm"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-food-text font-semibold">{selectedFood?.name}</p>
            <p className="text-food-text-m text-sm">
              {selectedFood?.price?.toFixed?.(2) ?? '0.00'} RON · {selectedFood?.calories ?? 0} kcal
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setSelectedFood(null)}>
              Not now
            </Button>
            <Button onClick={handleConfirmAddDebounced}>
              Add to cart
            </Button>
          </div>
        </div>
      </Modal>

      <OrderSuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        order={existingOrder}
        isUpdate={!!existingOrder?.id}
      />
    </div>
  )
}
