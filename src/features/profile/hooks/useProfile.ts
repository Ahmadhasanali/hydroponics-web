import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { ApiResponse, User } from '../../../lib/types'

export function useProfile() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ user: User }>>('/user')
      return res.data.user
    },
    retry: false,
    enabled: !!localStorage.getItem('auth_token'),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; email: string }) =>
      api.put<ApiResponse<{ user: User }>>('/user', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user'] })
    },
  })
}
