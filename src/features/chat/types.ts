export interface ChatSession {
  id: number
  user_id: number
  title: string | null
  messages_count: number
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: number
  chat_session_id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ChatReply {
  session_id: number
  title: string | null
  reply: string
}

export interface ChatSessionsResponse {
  sessions: ChatSession[]
}

export interface ChatMessagesResponse {
  messages: ChatMessage[]
}
