import { MessageSquareIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import type { ChatSession } from '../types'
import { Button } from '../../../components/ui/button'

interface ChatSessionListProps {
  sessions: ChatSession[]
  activeId: number | null
  onSelect: (id: number) => void
  onNew: () => void
  onDelete: (id: number) => void
}

export function ChatSessionList({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: ChatSessionListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button size="sm" variant="outline" className="w-full" onClick={onNew}>
          <PlusIcon />
          Chat Baru
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <p className="px-3 py-4 text-xs text-muted-foreground">Belum ada percakapan.</p>
        ) : (
          <ul className="space-y-1 p-2">
            {sessions.map((session) => (
              <li key={session.id}>
                <div
                  className={`group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${
                    activeId === session.id ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2"
                    onClick={() => onSelect(session.id)}
                  >
                    <MessageSquareIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{session.title ?? 'Chat baru'}</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Hapus percakapan"
                    className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/20 hover:text-destructive group-hover:opacity-100"
                    onClick={() => onDelete(session.id)}
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
