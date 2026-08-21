import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import type { ReminderOccurrence } from '../types'
import {
  useDeleteReminder,
  useOccurrenceDone,
  useOccurrenceSkip,
  useReminder,
} from '../hooks/useReminders'
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

const STATUS_LABEL: Record<string, string> = {
  pending: 'Menunggu',
  done: 'Selesai',
  skipped: 'Dilewati',
}

export function ReminderDetail({ reminderId }: { reminderId: number }) {
  const navigate = useNavigate()
  const { data: reminder, isLoading, isError } = useReminder(reminderId)
  const occurrenceDone = useOccurrenceDone()
  const occurrenceSkip = useOccurrenceSkip()
  const deleteReminder = useDeleteReminder()
  const [editOpen, setEditOpen] = useState(false)

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat pengingat...</p>
  if (isError || !reminder) return <p className="text-sm text-red-600">Gagal memuat pengingat.</p>

  const recurring = reminder.recurrence && reminder.recurrence.type !== 'none'
  const occurrences = reminder.occurrences ?? []

  const handleDelete = () => {
    if (!window.confirm(`Hapus reminder "${reminder.title}"?`)) return
    deleteReminder.mutate(reminder.id, {
      onSuccess: () =>
        navigate({ to: '/farms/$farmId/reminders', params: { farmId: String(reminder.farm_id) } }),
    })
  }

  return (
    <div className="space-y-4">
      <Link
        to="/farms/$farmId/reminders"
        params={{ farmId: String(reminder.farm_id) }}
        className="text-sm text-secondary hover:text-foreground hover:underline"
      >
        &larr; Kembali ke pengingat
      </Link>

      <Card>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">{reminder.title}</h1>
            {recurring && (
              <span className="rounded-full bg-info/20 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-info uppercase">
                Berulang
              </span>
            )}
          </div>
          {reminder.farm && <p className="text-sm text-muted-foreground">Farm: {reminder.farm.name}</p>}
          {reminder.body && <p className="text-sm text-muted-foreground">{reminder.body}</p>}
          <p className="text-xs text-muted-foreground">Mulai: {formatDate(reminder.starts_at)}</p>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteReminder.isPending}
            >
              Hapus
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Kemunculan</h2>
        {occurrences.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada kemunculan.</p>
        ) : (
          occurrences.map((occurrence: ReminderOccurrence) => (
            <Card key={occurrence.id}>
              <CardContent className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {formatDate(occurrence.scheduled_at)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {STATUS_LABEL[occurrence.status] ?? occurrence.status}
                    {occurrence.notified_at && ' · Notifikasi terkirim'}
                  </p>
                </div>
                {occurrence.status === 'pending' && (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        occurrenceDone.mutate({
                          reminderId: reminder.id,
                          occurrenceId: occurrence.id,
                        })
                      }
                      disabled={occurrenceDone.isPending}
                    >
                      Selesai
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        occurrenceSkip.mutate({
                          reminderId: reminder.id,
                          occurrenceId: occurrence.id,
                        })
                      }
                      disabled={occurrenceSkip.isPending}
                    >
                      Lewati
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ReminderForm
        open={editOpen}
        onOpenChange={setEditOpen}
        farmId={reminder.farm_id}
        reminder={reminder}
      />
    </div>
  )
}
