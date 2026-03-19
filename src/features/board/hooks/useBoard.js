import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'

function todayDate() {
  return new Date().toLocaleDateString('en-CA') // YYYY-MM-DD local time
}

export function useBoard() {
  return useQuery({
    queryKey: ['board', 'today'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('date', todayDate())
        .maybeSingle()
      if (error) throw error
      return data // null if no board today
    },
  })
}

export function useCreateBoard() {
  const queryClient = useQueryClient()
  const { profile } = useAuth()
  return useMutation({
    mutationFn: async (title) => {
      const { data, error } = await supabase
        .from('boards')
        .insert({ date: todayDate(), title: title || `Board ${todayDate()}`, created_by: profile.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board'] }),
  })
}

export function useCloseBoard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (boardId) => {
      const { error } = await supabase.from('boards').update({ status: 'closed' }).eq('id', boardId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board'] }),
  })
}

export function useFoodItems() {
  return useQuery({
    queryKey: ['food-items', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('is_active', true)
        .order('category')
      if (error) throw error
      return data
    },
  })
}
