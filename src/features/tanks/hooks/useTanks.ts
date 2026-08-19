import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { ApiResponse, Tank } from '../../../lib/types'
import type { CreateTankInput, TankDetail, UpdateTankInput } from '../types'

export function useTanks(farmId: number) {
  return useQuery({
    queryKey: ['tanks', 'list', farmId],
    queryFn: () =>
      api
        .get<ApiResponse<{ tanks: Tank[] }>>('/tanks', { params: { farm_id: farmId } })
        .then((r) => r.data.tanks),
    enabled: !!farmId,
  })
}

export function useTank(id: number) {
  return useQuery({
    queryKey: ['tanks', 'detail', id],
    queryFn: () =>
      api
        .get<ApiResponse<{ tank: TankDetail }>>(`/tanks/${id}`)
        .then((r) => r.data.tank),
    enabled: !!id,
  })
}

export function useCreateTank() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTankInput) =>
      api.post<ApiResponse<{ tank: Tank }>>('/tanks', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tanks'] }),
  })
}

export function useUpdateTank() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateTankInput & { id: number }) =>
      api.put<ApiResponse<{ tank: Tank }>>(`/tanks/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tanks'] }),
  })
}

export function useDeleteTank() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete<ApiResponse<{ success: boolean }>>(`/tanks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tanks'] }),
  })
}