import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { ChatMessagesResponse, ChatReply, ChatSessionsResponse } from '../types'

export function useChatSessions() {
  return useQuery({
    queryKey: ['chat', 'sessions'],
    queryFn: () => api.get<ChatSessionsResponse>('/chat/sessions'),
  })
}

export function useChatMessages(sessionId: number | null) {
  return useQuery({
    queryKey: ['chat', 'sessions', sessionId, 'messages'],
    queryFn: () => api.get<ChatMessagesResponse>(`/chat/sessions/${sessionId}/messages`),
    enabled: sessionId !== null,
  })
}

export function useChatSend() {
  return useMutation({
    mutationFn: ({ sessionId, message }: { sessionId: number | null; message: string }) =>
      api.post<ChatReply>('/chat', {
        ...(sessionId !== null ? { session_id: sessionId } : {}),
        message,
      }),
  })
}

export function useDeleteChatSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/chat/sessions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', 'sessions'] })
    },
  })
}
