import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { ApiResponse, Farm } from '../../../lib/types'
import type { FarmMember } from '../types'

export function useFarmMembers(farmId: number) {
  return useQuery({
    queryKey: ['farms', farmId, 'members'],
    queryFn: () =>
      api
        .get<ApiResponse<{ farm: { users: FarmMember[]; staff: unknown[] } }>>(`/farms/${farmId}/members`)
        .then((r) => r.data.farm),
    enabled: !!farmId,
  })
}

export function useAddFarmMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ farmId, email }: { farmId: number; email: string }) =>
      api.post<ApiResponse<{ farm: unknown }>>(`/farms/${farmId}/members`, { email }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['farms', vars.farmId, 'members'] })
      qc.invalidateQueries({ queryKey: ['farms', vars.farmId] })
      qc.invalidateQueries({ queryKey: ['farms'] })
    },
  })
}

export function useRemoveFarmMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ farmId, farmUserId }: { farmId: number; farmUserId: number }) =>
      api.delete<ApiResponse<null>>(`/farms/${farmId}/members/${farmUserId}`),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['farms', vars.farmId, 'members'] })
      qc.invalidateQueries({ queryKey: ['farms', vars.farmId] })
    },
  })
}

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