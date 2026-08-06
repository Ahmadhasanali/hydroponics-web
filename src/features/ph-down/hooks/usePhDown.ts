import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { ApiResponse, PaginatedResponse } from '../../../lib/types'
import type { PhDownLog, CreatePhDownInput, UpdatePhDownInput } from '../types'

interface PhDownMutationResult {
  ph_down: PhDownLog
}

export function usePhDown(farmId: number, page = 1) {
  return useQuery({
    queryKey: ['ph-down', farmId, page],
    queryFn: () =>
      api.get<PaginatedResponse<PhDownLog>>('/ph-down', {
        params: { farm_id: farmId, page },
      }),
    enabled: !!farmId,
  })
}

export function useCreatePhDown() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePhDownInput) =>
      api
        .post<ApiResponse<PhDownMutationResult>>('/ph-down', data)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ph-down'] })
      qc.invalidateQueries({ queryKey: ['tanks'] })
    },
  })
}

export function useUpdatePhDown() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: UpdatePhDownInput & { id: number }) =>
      api
        .put<ApiResponse<PhDownMutationResult>>(`/ph-down/${id}`, data)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ph-down'] })
      qc.invalidateQueries({ queryKey: ['tanks'] })
    },
  })
}

export function useDeletePhDown() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api.delete<ApiResponse<{ success: boolean }>>(`/ph-down/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ph-down'] })
      qc.invalidateQueries({ queryKey: ['tanks'] })
    },
  })
}