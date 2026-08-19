import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { MessageCircleIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, SendIcon, XIcon } from 'lucide-react'
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
  const [showHistory, setShowHistory] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const sessionsQuery = useChatSessions()
  const messagesQuery = useChatMessages(activeSessionId)
  const sendMutation = useChatSend()
  const deleteSession = useDeleteChatSession()
  const queryClient = useQueryClient()

  const scrollRef = useRef<HTMLDivElement>(null)
  const lastOpenedRef = useRef(0)

  const messages = messagesQuery.data?.messages ?? []

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages.length, activeSessionId, open])

  useEffect(() => {
    if (!open || !sessionsQuery.data) return
    // Re-evaluate every time the dialog is opened (not just the first time),
    // so a session becomes stale after 24h and a fresh chat + welcome shows.
    const openedAt = Date.now()
    const shouldReapply = openedAt - lastOpenedRef.current > 60 * 1000
    if (!shouldReapply) return
    lastOpenedRef.current = openedAt

    const sessions = sessionsQuery.data.sessions ?? []
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    const recent = sessions.find(
      (s) => s.updated_at && new Date(s.updated_at).getTime() >= cutoff,
    )
    setActiveSessionId(recent ? recent.id : null)
    setError(null)
  }, [open, sessionsQuery.data])

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
        className="fixed right-6 bottom-20 z-40 h-14 w-14 rounded-full bg-secondary text-secondary-foreground shadow-lg shadow-secondary/30 hover:bg-secondary/90 lg:bottom-6"
        size="icon"
      >
        <MessageCircleIcon className="size-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[70vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
        >
          <DialogHeader className="flex flex-row items-center justify-between gap-2 rounded-t-[2rem] border-b border-background/10 bg-foreground px-4 py-3">
            <DialogTitle className="text-background">Asisten Hidroponik</DialogTitle>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={showHistory ? 'Sembunyikan riwayat' : 'Tampilkan riwayat'}
                onClick={() => setShowHistory((v) => !v)}
                className="text-background/70 hover:bg-background/10 hover:text-background"
              >
                {showHistory ? <PanelLeftCloseIcon /> : <PanelLeftOpenIcon />}
              </Button>
              <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Tutup chat"
                  className="text-background/70 hover:bg-background/10 hover:text-background"
                />
              }
            >
              <XIcon />
            </DialogClose>
            </div>
          </DialogHeader>

          <div className="flex min-h-0 flex-1">
            {showHistory && (
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
            )}
            <section className="flex min-w-0 flex-1 flex-col">
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {activeSessionId === null ? (
                  <div className="space-y-3">
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-xl bg-muted px-3 py-2 text-sm">
                        Halo! Saya asisten hidroponik Anda. Saya bisa membantu mencatat monitoring, nutrisi, pH, dan menjawab pertanyaan seputar kebun Anda. Silakan mulai percakapan!
                      </div>
                    </div>
                    <p className="text-center text-xs text-muted-foreground">
                      Mulai percakapan baru atau pilih riwayat di samping.
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
