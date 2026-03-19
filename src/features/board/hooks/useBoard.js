import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['board'] }); toast.success("Today's board created!") },
    onError: (e) => toast.error(`Failed to create board: ${e.message}`),
  })
}

export function useCloseBoard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (boardId) => {
      const { error } = await supabase.from('boards').update({ status: 'closed' }).eq('id', boardId)
      if (error) throw error
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['board'] }); toast.success('Board closed — ordering disabled.') },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  })
}

export function useReopenBoard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (boardId) => {
      const { error } = await supabase.from('boards').update({ status: 'open' }).eq('id', boardId)
      if (error) throw error
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['board'] }); toast.success('Board reopened — ordering is open!') },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  })
}

export function useAllBoards() {
  return useQuery({
    queryKey: ['boards', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('boards')
        .select('id, date, title, status')
        .order('date', { ascending: false })
      if (error) throw error
      return data
    },
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
