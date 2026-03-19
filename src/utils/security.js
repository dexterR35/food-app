import { z } from 'zod'

const SAFE_TEXT_PATTERN = /[^\p{L}\p{N}\p{P}\p{Zs}]/gu

function normalizeSpaces(value) {
  return value.replace(/\s+/g, ' ').trim()
}

export function sanitizeText(value, { maxLength = 500 } = {}) {
  if (typeof value !== 'string') return ''
  const noControlChars = value.replace(SAFE_TEXT_PATTERN, '')
  return normalizeSpaces(noControlChars).slice(0, maxLength)
}

export function sanitizeEmail(value) {
  if (typeof value !== 'string') return ''
  return value.trim().toLowerCase()
}

export function clampNumber(value, { min = 0, max = Number.MAX_SAFE_INTEGER, fallback = 0 } = {}) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(parsed, min), max)
}

const orderItemSchema = z.object({
  food_item_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(50),
  unit_price: z.number().min(0).max(10000),
  unit_calories: z.number().int().min(0).max(10000),
  note: z.string().max(300).optional(),
})

const orderPayloadSchema = z.object({
  boardId: z.string().uuid(),
  existingOrderId: z.string().uuid().optional(),
  totalPrice: z.number().min(0).max(200000),
  totalCalories: z.number().int().min(0).max(500000),
  items: z.array(orderItemSchema).min(1).max(100),
})

export function sanitizeOrderPayload(payload) {
  const normalized = {
    boardId: payload?.boardId,
    existingOrderId: payload?.existingOrderId || undefined,
    totalPrice: clampNumber(payload?.totalPrice, { min: 0, max: 200000, fallback: 0 }),
    totalCalories: Math.round(clampNumber(payload?.totalCalories, { min: 0, max: 500000, fallback: 0 })),
    items: Array.isArray(payload?.items)
      ? payload.items.map((item) => ({
          food_item_id: item?.food_item_id,
          quantity: Math.round(clampNumber(item?.quantity, { min: 1, max: 50, fallback: 1 })),
          unit_price: clampNumber(item?.unit_price, { min: 0, max: 10000, fallback: 0 }),
          unit_calories: Math.round(clampNumber(item?.unit_calories, { min: 0, max: 10000, fallback: 0 })),
          note: sanitizeText(item?.note ?? '', { maxLength: 300 }) || undefined,
        }))
      : [],
  }

  return orderPayloadSchema.parse(normalized)
}
