import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { ApiResponse, PaginatedResponse } from '../../../lib/types'
import type { NutrientAddition, CreateNutrientInput, UpdateNutrientInput } from '../types'

interface NutrientMutationResult {
  nutrient: NutrientAddition
}

export function useNutrients(farmId: number, page = 1) {
  return useQuery({
    queryKey: ['nutrients', farmId, page],
    queryFn: () =>
      api.get<PaginatedResponse<NutrientAddition>>('/nutrients', {
        params: { farm_id: farmId, page },
      }),
    enabled: !!farmId,
  })
}

export function useCreateNutrient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateNutrientInput) =>
      api
        .post<ApiResponse<NutrientMutationResult>>('/nutrients', data)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nutrients'] })
      qc.invalidateQueries({ queryKey: ['tanks'] })
    },
  })
}

export function useUpdateNutrient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateNutrientInput & { id: number }) =>
      api
        .put<ApiResponse<NutrientMutationResult>>(`/nutrients/${id}`, data)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nutrients'] })
      qc.invalidateQueries({ queryKey: ['tanks'] })
    },
  })
}

export function useDeleteNutrient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api.delete<ApiResponse<{ success: boolean }>>(`/nutrients/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nutrients'] })
      qc.invalidateQueries({ queryKey: ['tanks'] })
    },
  })
}