import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { ApiResponse, PaginatedResponse } from '../../../lib/types'
import type { CreateReminderInput, Reminder, UpdateReminderInput } from '../types'

export function useReminders(farmId: number, page = 1) {
  return useQuery({
    queryKey: ['reminders', farmId, page],
    queryFn: () =>
      api.get<PaginatedResponse<Reminder>>('/reminders', {
        params: { farm_id: farmId, page },
      }),
    enabled: !!farmId,
  })
}

export function useGlobalReminders(page = 1) {
  return useQuery({
    queryKey: ['reminders', 'all', page],
    queryFn: () =>
      api.get<PaginatedResponse<Reminder>>('/reminders', {
        params: { page },
      }),
  })
}

export function useCreateReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateReminderInput) =>
      api.post<ApiResponse<{ reminder: Reminder }>>('/reminders', data),
    onSuccess: (_res, variables) => {
      qc.invalidateQueries({ queryKey: ['reminders', variables.farm_id] })
      qc.invalidateQueries({ queryKey: ['reminders'] })
    },
  })
}

export function useUpdateReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateReminderInput & { id: number }) =>
      api.put<ApiResponse<{ reminder: Reminder }>>(`/reminders/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] })
    },
  })
}

export function useDeleteReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/reminders/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] })
    },
  })
}
