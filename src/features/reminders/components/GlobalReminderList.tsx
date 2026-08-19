import { useState } from 'react'
import type { Reminder } from '../types'
import { useGlobalReminders } from '../hooks/useReminders'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'

function formatDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function GlobalReminderList() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching } = useGlobalReminders(page)

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat pengingat...</p>
  if (isError) return <p className="text-sm text-red-600">Gagal memuat pengingat.</p>

  const reminders = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-3">
      {reminders.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada pengingat.</p>
      ) : (
        reminders.map((reminder: Reminder) => (
          <Card key={reminder.id}>
            <CardContent className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{reminder.title}</p>
                  {reminder.farm && (
                    <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-secondary uppercase">
                      {reminder.farm.name}
                    </span>
                  )}
                </div>
                {reminder.body && (
                  <p className="text-sm text-muted-foreground">{reminder.body}</p>
                )}
                <p className="text-xs text-muted-foreground">{formatDate(reminder.starts_at)}</p>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Sebelumnya
          </Button>
          <span className="text-muted-foreground">Halaman {meta.current_page} dari {meta.last_page}</span>
          <Button variant="outline" size="sm" disabled={page >= meta.last_page || isFetching} onClick={() => setPage((p) => p + 1)}>
            Berikutnya
          </Button>
        </div>
      )}
    </div>
  )
}
