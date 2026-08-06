import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { api } from '../lib/api'
import type { ApiResponse, AuthResponse, User } from '../lib/types'

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ user: User }>>('/user')
      return res.data.user
    },
    retry: false,
    enabled: !!localStorage.getItem('auth_token'),
  })

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await api.post<ApiResponse<AuthResponse>>('/login', credentials)
      return res.data
    },
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token)
      queryClient.setQueryData(['user'], data.user)
      navigate({ to: '/' })
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; password: string; password_confirmation: string }) => {
      const res = await api.post<ApiResponse<AuthResponse>>('/register', data)
      return res.data
    },
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token)
      queryClient.setQueryData(['user'], data.user)
      navigate({ to: '/' })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => api.post('/logout'),
    onSuccess: () => {
      localStorage.removeItem('auth_token')
      queryClient.clear()
      navigate({ to: '/login' })
    },
  })

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
  }
}