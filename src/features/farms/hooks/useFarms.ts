import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { ApiResponse, Farm } from '../../../lib/types'

export function useFarms() {
  return useQuery({
    queryKey: ['farms'],
    queryFn: () => api.get<ApiResponse<{ farms: Farm[] }>>('/farms').then(r => r.data.farms),
  })
}

export function useFarm(id: number) {
  return useQuery({
    queryKey: ['farms', id],
    queryFn: () => api.get<ApiResponse<{ farm: Farm }>>(`/farms/${id}`).then(r => r.data.farm),
    enabled: !!id,
  })
}

export function useCreateFarm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Farm>) => api.post<ApiResponse<{ farm: Farm }>>('/farms', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['farms'] }),
  })
}

export function useUpdateFarm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Farm> & { id: number }) => api.put(`/farms/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['farms'] }),
  })
}

export function useDeleteFarm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/farms/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['farms'] }),
  })
}