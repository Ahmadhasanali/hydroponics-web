import { useState } from 'react'
import type { Reminder } from '../types'
import { useReminders, useDeleteReminder } from '../hooks/useReminders'
import { ReminderForm } from './ReminderForm'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'

function formatDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ReminderList({ farmId }: { farmId: number }) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching } = useReminders(farmId, page)
  const deleteReminder = useDeleteReminder()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Reminder | undefined>(undefined)

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat reminder...</p>
  if (isError) return <p className="text-sm text-red-500">Gagal memuat reminder.</p>

  const reminders = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Reminder</h1>
        <Button
          onClick={() => {
            setEditing(undefined)
            setFormOpen(true)
          }}
        >
          Tambah Reminder
        </Button>
      </div>

      {reminders.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada reminder.</p>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => {
            const recurring = reminder.recurrence && reminder.recurrence.type !== 'none'
            return (
              <Card key={reminder.id}>
                <CardContent className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{reminder.title}</p>
                      {recurring && (
                        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                          Berulang
                        </span>
                      )}
                    </div>
                    {reminder.body && (
                      <p className="text-sm text-muted-foreground">{reminder.body}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(reminder.starts_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(reminder)
                        setFormOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`Hapus reminder "${reminder.title}"?`)) {
                          deleteReminder.mutate(reminder.id)
                        }
                      }}
                      disabled={deleteReminder.isPending}
                    >
                      Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Sebelumnya
          </Button>
          <span className="text-muted-foreground">
            Halaman {meta.current_page} dari {meta.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.last_page || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Berikutnya
          </Button>
        </div>
      )}

      <ReminderForm
        open={formOpen}
        onOpenChange={setFormOpen}
        farmId={farmId}
        reminder={editing}
      />
    </div>
  )
}
