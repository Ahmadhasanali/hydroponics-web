import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { ApiResponse, PaginatedResponse } from '../../../lib/types'
import type { DailyMonitoring, CreateMonitoringInput, UpdateMonitoringInput } from '../types'

interface MonitoringMutationResult {
  monitoring: DailyMonitoring
  warnings?: string
}

export function useMonitoring(farmId: number, page = 1) {
  return useQuery({
    queryKey: ['monitoring', farmId, page],
    queryFn: () =>
      api.get<PaginatedResponse<DailyMonitoring>>('/monitoring', {
        params: { farm_id: farmId, page },
      }),
    enabled: !!farmId,
  })
}

export function useTankMonitorings(tankId: number) {
  return useQuery({
    queryKey: ['tanks', 'detail', tankId, 'monitorings'],
    queryFn: () =>
      api
        .get<ApiResponse<{ tank: unknown; monitorings: PaginatedResponse<DailyMonitoring> }>>(
          `/tanks/${tankId}`,
        )
        .then((r) => r.data.monitorings),
    enabled: !!tankId,
  })
}

export function useCreateMonitoring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMonitoringInput) =>
      api
        .post<ApiResponse<MonitoringMutationResult>>('/monitoring', data)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['monitoring'] })
      qc.invalidateQueries({ queryKey: ['tanks'] })
    },
  })
}

export function useUpdateMonitoring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateMonitoringInput & { id: number }) =>
      api
        .put<ApiResponse<MonitoringMutationResult>>(`/monitoring/${id}`, data)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['monitoring'] })
      qc.invalidateQueries({ queryKey: ['tanks'] })
    },
  })
}

export function useDeleteMonitoring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      api.delete<ApiResponse<{ success: boolean }>>(`/monitoring/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['monitoring'] })
      qc.invalidateQueries({ queryKey: ['tanks'] })
    },
  })
}