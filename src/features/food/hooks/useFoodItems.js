import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'

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
      if (item.id) {
        const { id, ...rest } = item
        const { error } = await supabase.from('food_items').update(rest).eq('id', id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('food_items').insert(item)
        if (error) throw error
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['food-items'] }),
  })
}

export function useToggleFoodItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_active }) => {
      const { error } = await supabase.from('food_items').update({ is_active }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['food-items'] }),
  })
}
