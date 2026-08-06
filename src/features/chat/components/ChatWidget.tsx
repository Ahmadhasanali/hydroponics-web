import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { MessageCircleIcon, SendIcon, XIcon } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../../../components/ui/dialog'
import {
  useChatMessages,
  useChatSessions,
  useChatSend,
  useDeleteChatSession,
} from '../hooks/useChat'
import { ChatSessionList } from './ChatSessionList'
import type { ChatMessagesResponse } from '../types'

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const sessionsQuery = useChatSessions()
  const messagesQuery = useChatMessages(activeSessionId)
  const sendMutation = useChatSend()
  const deleteSession = useDeleteChatSession()
  const queryClient = useQueryClient()

  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = messagesQuery.data?.messages ?? []

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages.length, activeSessionId, open])

  const handleSend = () => {
    const text = input.trim()
    if (!text || sendMutation.isPending) return
    setError(null)
    sendMutation.mutate(
      { sessionId: activeSessionId, message: text },
      {
        onSuccess: (res) => {
          const sessionId = res.session_id
          const messagesKey: unknown[] = ['chat', 'sessions', sessionId, 'messages']
          const existing = queryClient.getQueryData<ChatMessagesResponse>(messagesKey)?.messages ?? []
          const now = new Date().toISOString()
          queryClient.setQueryData<ChatMessagesResponse>(messagesKey, {
            messages: [
              ...existing,
              { id: Date.now(), chat_session_id: sessionId, role: 'user', content: text, created_at: now },
              { id: Date.now() + 1, chat_session_id: sessionId, role: 'assistant', content: res.reply, created_at: now },
            ],
          })
          setActiveSessionId(sessionId)
          setInput('')
          queryClient.invalidateQueries({ queryKey: ['chat', 'sessions'] })
        },
        onError: (err) => {
          const reply = (err as { reply?: string } | undefined)?.reply
          setError(reply ?? 'Terjadi kesalahan. Silakan coba lagi.')
        },
      },
    )
  }

  const handleDeleteSession = (id: number) => {
    if (!window.confirm('Hapus percakapan ini?')) return
    deleteSession.mutate(id, {
      onSuccess: () => {
        if (activeSessionId === id) setActiveSessionId(null)
      },
    })
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        aria-label="Buka chat"
        className="fixed right-6 bottom-20 z-40 h-14 w-14 rounded-full bg-[#ffce54] text-[#1a1c1e] shadow-lg shadow-[#ffce54]/30 hover:bg-[#f0b830] lg:bottom-6"
        size="icon"
      >
        <MessageCircleIcon className="size-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[70vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
        >
          <DialogHeader className="flex flex-row items-center justify-between gap-2 rounded-t-[2rem] border-b border-white/10 bg-[#1a1c1e] px-4 py-3">
            <DialogTitle className="text-white">Asisten Hidroponik</DialogTitle>
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Tutup chat"
                  className="text-white/70 hover:bg-white/10 hover:text-white"
                />
              }
            >
              <XIcon />
            </DialogClose>
          </DialogHeader>

          <div className="flex min-h-0 flex-1">
            <aside className="w-60 shrink-0 border-r bg-muted/20">
              <ChatSessionList
                sessions={sessionsQuery.data?.sessions ?? []}
                activeId={activeSessionId}
                onSelect={setActiveSessionId}
                onNew={() => {
                  setActiveSessionId(null)
                  setError(null)
                }}
                onDelete={handleDeleteSession}
              />
            </aside>

            <section className="flex min-w-0 flex-1 flex-col">
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {activeSessionId === null ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Mulai percakapan baru dengan asisten hidroponik.
                    </p>
                  </div>
                ) : messagesQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">Memuat pesan...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada pesan.</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t p-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Tulis pesan..."
                    disabled={sendMutation.isPending}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || sendMutation.isPending}
                    aria-label="Kirim"
                  >
                    <SendIcon />
                  </Button>
                </div>
                {sendMutation.isPending && (
                  <p className="mt-2 text-xs text-muted-foreground">Asisten sedang mengetik...</p>
                )}
                {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
