import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

/**
 * Subscribe to Supabase Realtime and invalidate TanStack Query keys on changes.
 * @param {string} channel - unique channel name
 * @param {string} table - DB table to watch
 * @param {string|null} filter - e.g. 'board_id=eq.abc123'
 * @param {string[][]} queryKeys - array of query keys to invalidate on change
 */
export function useRealtime({ channel, table, filter, queryKeys }) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const config = { event: '*', schema: 'public', table }
    if (filter) config.filter = filter

    const sub = supabase
      .channel(channel)
      .on('postgres_changes', config, () => {
        queryKeys.forEach(key => queryClient.invalidateQueries({ queryKey: key }))
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [channel, table, filter]) // eslint-disable-line
}
