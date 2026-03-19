import { useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle, Flame, ShoppingBag, Clock } from 'lucide-react'
import Modal from '../../../components/ui/Modal'
import { orderItemDisplayName } from '../../../utils/orderDisplay'

const JOKES = [
  "Your stomach called. It said 'FINALLY.' 🎉",
  "The chef may or may not have sneezed. Totally fine though. 👨‍🍳",
  "Calories? Never heard of her. 🤷",
  "Your future self is grateful. Your scale, less so. ⚖️",
  "Bold order. We fully support it. 😎",
  "This has been judged and approved by your taste buds. 👅",
  "Fun fact: statistically your best decision today. 📊",
  "The food won't eat itself. Unfortunately. 😤",
  "Somewhere a nutritionist is crying. But you're happy. That's what matters. 💅",
  "You have unlocked: lunch. Achievement get. 🏆",
]

const REVOLUT_BASE = import.meta.env.VITE_REVOLUT_ME

export default function OrderSuccessModal({ open, onClose, order, isUpdate }) {
  const joke = useMemo(
    () => JOKES[Math.floor(Math.random() * JOKES.length)],
    // pick a new joke each time the modal opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open]
  )

  const amount   = order?.total_price?.toFixed(2) ?? '0.00'
  const calories = order?.total_calories ?? 0
  const items    = order?.order_items ?? []

  // Build Revolut QR URL: https://revolut.me/username/AMOUNT/RON
  const revolutUrl = REVOLUT_BASE
    ? `${REVOLUT_BASE}/${amount}/RON`
    : null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isUpdate ? 'Order updated!' : 'Order placed!'}
      size="md"
    >
      <div className="space-y-5">

        {/* ── Success banner ── */}
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <div className="w-14 h-14 rounded-full bg-food-accent-d flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-food-accent" />
          </div>
          <p className="text-food-text font-bold text-lg">
            {isUpdate ? 'You updated your order!' : 'You ordered this!'}
          </p>
          <p className="text-food-text-m text-sm italic">{joke}</p>
        </div>

        {/* ── Order items ── */}
        <div className="bg-food-elevated rounded-xl divide-y divide-food-border">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2.5 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-full bg-food-accent-d text-food-accent text-[10px] font-bold flex items-center justify-center shrink-0">
                  {item.quantity}
                </span>
                <span className="text-food-text text-sm font-medium truncate">
                  {orderItemDisplayName(item)}
                </span>
              </div>
              <span className="text-food-text-s text-sm font-semibold shrink-0">
                {(item.unit_price * item.quantity).toFixed(2)} RON
              </span>
            </div>
          ))}
          {/* Totals */}
          <div className="flex items-center justify-between px-4 py-3 gap-3">
            <span className="flex items-center gap-1.5 text-food-text-m text-xs">
              <Flame className="w-3.5 h-3.5 text-food-crimson" />{calories} kcal
            </span>
            <span className="text-food-text font-extrabold text-base">
              {amount} <span className="text-food-text-m font-semibold text-xs">RON</span>
            </span>
          </div>
        </div>

        {/* ── Revolut QR ── */}
        {revolutUrl ? (
          <div className="bg-food-elevated rounded-xl p-4 flex flex-col items-center gap-3 text-center">
            <p className="text-food-text font-semibold text-sm flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-food-accent" />
              Pay with Revolut
            </p>
            <p className="text-food-text-m text-xs">Scan to send <strong className="text-food-text">{amount} RON</strong> directly</p>

            {/* QR code — white bg so it scans in dark mode */}
            <div className="p-3 bg-white rounded-xl shadow-card">
              <QRCodeSVG
                value={revolutUrl}
                size={160}
                level="M"
                includeMargin={false}
              />
            </div>

            <p className="text-food-text-m text-[11px]">
              Opens Revolut · amount pre-filled · instant transfer
            </p>
          </div>
        ) : (
          <div className="bg-food-elevated rounded-xl p-4 flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-food-text-m shrink-0" />
            <p className="text-food-text-m text-sm">
              Set <code className="text-food-accent text-xs">VITE_REVOLUT_ME</code> in <code className="text-xs">.env</code> to enable the payment QR.
            </p>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-food-border text-food-text-s hover:text-food-text hover:bg-food-elevated text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            I'll pay later
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl bg-food-accent hover:bg-food-accent-h text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Done
          </button>
        </div>

      </div>
    </Modal>
  )
}
