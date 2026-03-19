import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { sanitizeText, clampNumber } from '../../../utils/security'

function sanitizeFoodItemInput(item) {
  const menuParts = Array.isArray(item?.menu_parts)
    ? item.menu_parts
        .map((part) => sanitizeText(part ?? '', { maxLength: 80 }))
        .filter(Boolean)
        .slice(0, 3)
    : []

  return {
    ...item,
    name: sanitizeText(item?.name, { maxLength: 120 }),
    description: sanitizeText(item?.description ?? '', { maxLength: 500 }) || null,
    category: sanitizeText(item?.category, { maxLength: 40 }),
    image_url: typeof item?.image_url === 'string' ? item.image_url.trim() : null,
    price: clampNumber(item?.price, { min: 0, max: 10000, fallback: 0 }),
    calories: Math.round(clampNumber(item?.calories, { min: 0, max: 10000, fallback: 0 })),
    protein_g: clampNumber(item?.protein_g, { min: 0, max: 1000, fallback: 0 }),
    carbs_g: clampNumber(item?.carbs_g, { min: 0, max: 1000, fallback: 0 }),
    fat_g: clampNumber(item?.fat_g, { min: 0, max: 1000, fallback: 0 }),
    menu_parts: menuParts.length ? menuParts : null,
  }
}

export function useAllFoodItems() {
  return useQuery({
    queryKey: ['food-items', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('food_items').select('*').order('category')
      if (error) throw error
      return data
    },
  })
}

export function useSaveFoodItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (item) => {
      const safeItem = sanitizeFoodItemInput(item)
      if (item.id) {
        const { id, ...rest } = safeItem
        const { error } = await supabase.from('food_items').update(rest).eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('food_items').insert(safeItem)
        if (error) throw error
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['food-items'] })
      toast.success(vars.id ? 'Food item updated!' : 'Food item added!')
    },
    onError: (e) => toast.error(`Save failed: ${e.message}`),
  })
}

export function useToggleFoodItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_active }) => {
      const { error } = await supabase.from('food_items').update({ is_active }).eq('id', id)
      if (error) throw error
      return is_active
    },
    onSuccess: (is_active) => {
      queryClient.invalidateQueries({ queryKey: ['food-items'] })
      toast.success(is_active ? 'Item activated.' : 'Item deactivated.')
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  })
}
