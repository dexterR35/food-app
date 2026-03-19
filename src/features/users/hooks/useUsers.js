import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'

export function useAllUsers() {
  return useQuery({
    queryKey: ['users', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username, nickname, department, role, status, created_at, avatar_url')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { error } = await supabase.from('users').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      if (vars.status === 'approved') toast.success('User approved!')
      else if (vars.status === 'rejected') toast.error('User rejected.')
      else if (vars.role) toast.success(`Role changed to ${vars.role}.`)
      else toast.success('User updated.')
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  })
}

export function useInvitations() {
  return useQuery({
    queryKey: ['user-invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('id, email, role, invited_at, accepted_at')
        .order('invited_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useInviteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ email }) => {
      const { error } = await supabase.functions.invoke('invite-user', {
        body: { email: email.toLowerCase() },
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] })
      toast.success('Invitation sent.')
    },
    onError: (e) => toast.error(`Invite failed: ${e.message}`),
  })
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('user_invitations').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] })
      toast.success('Invitation removed.')
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  })
}

