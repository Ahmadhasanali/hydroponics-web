import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { ApiResponse, PaginatedResponse } from '../../../lib/types'
import type { CreateReminderInput, Reminder, ReminderOccurrence, UpdateReminderInput } from '../types'

export type RemindersView = 'aktif' | 'riwayat'

export function useReminders(farmId: number, page = 1, view: RemindersView = 'aktif') {
  return useQuery({
    queryKey: ['reminders', farmId, view, page],
    queryFn: () =>
      api.get<PaginatedResponse<Reminder>>('/reminders', {
        params: {
          farm_id: farmId,
          page,
          ...(view === 'riwayat' ? { history: 1 } : { upcoming: 1 }),
        },
      }),
    enabled: !!farmId,
  })
}

export function useGlobalReminders(page = 1, view: RemindersView = 'aktif') {
  return useQuery({
    queryKey: ['reminders', 'all', view, page],
    queryFn: () =>
      api.get<PaginatedResponse<Reminder>>('/reminders', {
        params: { page, ...(view === 'riwayat' ? { history: 1 } : { upcoming: 1 }) },
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

export function useReminder(id: number) {
  return useQuery({
    queryKey: ['reminders', 'detail', id],
    queryFn: () =>
      api
        .get<ApiResponse<{ reminder: Reminder }>>(`/reminders/${id}`)
        .then((r) => r.data.reminder),
    enabled: !!id,
  })
}

export function useOccurrenceDone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reminderId, occurrenceId }: { reminderId: number; occurrenceId: number }) =>
      api.post<ApiResponse<{ occurrence: ReminderOccurrence }>>(
        `/reminders/${reminderId}/occurrences/${occurrenceId}/done`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] })
    },
  })
}

export function useOccurrenceSkip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reminderId, occurrenceId }: { reminderId: number; occurrenceId: number }) =>
      api.post<ApiResponse<{ occurrence: ReminderOccurrence }>>(
        `/reminders/${reminderId}/occurrences/${occurrenceId}/skip`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] })
    },
  })
}

export function useAcknowledgeReminder() {
  return useMutation({
    mutationFn: ({ reminderId, occurrenceId }: { reminderId: number; occurrenceId: number }) =>
      api.post<ApiResponse<{ message: string }>>(
        `/reminders/${reminderId}/occurrences/${occurrenceId}/acknowledge`,
      ),
  })
}
