import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'

export function useTelegramStatus() {
  return useQuery({
    queryKey: ['telegram', 'status'],
    queryFn: () => api.get('/telegram/status').then((r) => (r as { data: unknown }).data),
    refetchInterval: 3000,
  })
}

export function useGenerateLinkCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/telegram/link-code').then((r) => (r as { data: unknown }).data as { code: string }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['telegram', 'status'] })
    },
  })
}

export function useUnlinkTelegram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/telegram/unlink'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['telegram', 'status'] })
    },
  })
}

export function useUpdateDefaultFarm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (farm_id: number) => api.patch('/telegram/default-farm', { farm_id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['telegram', 'status'] })
    },
  })
}
