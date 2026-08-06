import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { ApiResponse } from '../../../lib/types'
import type { CreateStaffInput, Staff } from '../types'

export function useFarmStaff(farmId: number) {
  return useQuery({
    queryKey: ['farms', farmId, 'staff'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ farm: { users: unknown[]; staff: Staff[] } }>>(
        `/farms/${farmId}/members`,
      )
      return res.data.farm.staff
    },
    enabled: !!farmId,
  })
}

export function useCreateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ farmId, ...data }: CreateStaffInput & { farmId: number }) =>
      api.post<ApiResponse<{ staff: Staff }>>(`/farms/${farmId}/staff`, data),
    onSuccess: (_res, variables) => {
      qc.invalidateQueries({ queryKey: ['farms', variables.farmId] })
    },
  })
}

export function useToggleStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ farmId, staffId }: { farmId: number; staffId: number }) =>
      api.put<ApiResponse<{ staff: Staff }>>(`/farms/${farmId}/staff/${staffId}/toggle`),
    onSuccess: (_res, variables) => {
      qc.invalidateQueries({ queryKey: ['farms', variables.farmId] })
    },
  })
}

export function useResetStaffPassword() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      farmId,
      staffId,
      password,
    }: { farmId: number; staffId: number; password: string }) =>
      api.put<ApiResponse<null>>(`/farms/${farmId}/staff/${staffId}/password`, { password }),
    onSuccess: (_res, variables) => {
      qc.invalidateQueries({ queryKey: ['farms', variables.farmId] })
    },
  })
}

export function useDeleteStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ farmId, staffId }: { farmId: number; staffId: number }) =>
      api.delete<ApiResponse<null>>(`/farms/${farmId}/staff/${staffId}`),
    onSuccess: (_res, variables) => {
      qc.invalidateQueries({ queryKey: ['farms', variables.farmId] })
    },
  })
}
