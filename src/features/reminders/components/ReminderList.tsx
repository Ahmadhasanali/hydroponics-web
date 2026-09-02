import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Reminder } from '../types'
import { useDeleteReminder, useReminders } from '../hooks/useReminders'
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

function getNearestMillis(reminder: Reminder): number {
  const occ = reminder.occurrences ?? []
  const pending = occ.filter((o) => o.status === 'pending' && !o.notified_at)
  const candidate =
    pending.length > 0
      ? [...pending].sort(
          (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
        )[0].scheduled_at
      : reminder.starts_at
  const t = new Date(candidate).getTime()
  return Number.isNaN(t) ? Infinity : t
}

function getLatestMillis(reminder: Reminder): number {
  const occ = reminder.occurrences ?? []
  const candidate =
    occ.length > 0
      ? [...occ].sort(
          (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
        )[0].scheduled_at
      : reminder.starts_at
  const t = new Date(candidate).getTime()
  return Number.isNaN(t) ? -Infinity : t
}

function ReminderCard({
  reminder,
  showEdit,
  onEdit,
  onDelete,
  onOpen,
}: {
  reminder: Reminder
  showEdit: boolean
  onEdit?: () => void
  onDelete?: () => void
  onOpen: () => void
}) {
  const recurring = reminder.recurrence && reminder.recurrence.type !== 'none'
  return (
    <Card className="cursor-pointer transition-colors hover:bg-secondary/5" onClick={onOpen}>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{reminder.title}</p>
            {recurring && (
              <span className="rounded-full bg-info/20 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-info uppercase">
                Berulang
              </span>
            )}
          </div>
          {reminder.body && <p className="text-sm text-muted-foreground">{reminder.body}</p>}
          <p className="text-xs text-muted-foreground">{formatDate(reminder.starts_at)}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {showEdit && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              Hapus
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ReminderList({ farmId }: { farmId: number }) {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const activeQuery = useReminders(farmId, activePage, 'aktif')
  const historyQuery = useReminders(farmId, historyPage, 'riwayat')
  const deleteReminder = useDeleteReminder()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Reminder | undefined>(undefined)

  const openDetail = (r: Reminder) =>
    navigate({
      to: '/farms/$farmId/reminders/$reminderId',
      params: { farmId: String(r.farm_id), reminderId: String(r.id) },
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Pengingat</h1>
        <Button
          onClick={() => {
            setEditing(undefined)
            setFormOpen(true)
          }}
        >
          Tambah Reminder
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">Aktif</h2>
        {activeQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Memuat pengingat...</p>
        ) : activeQuery.isError ? (
          <p className="text-sm text-red-600">Gagal memuat pengingat aktif.</p>
        ) : (activeQuery.data?.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada pengingat aktif.</p>
        ) : (
          <div className="space-y-3">
            {[...(activeQuery.data?.data ?? [])]
              .sort((a, b) => getNearestMillis(a) - getNearestMillis(b))
              .map((r) => (
                <ReminderCard
                  key={r.id}
                  reminder={r}
                  showEdit
                  onEdit={() => {
                    setEditing(r)
                    setFormOpen(true)
                  }}
                  onDelete={() => {
                    if (window.confirm(`Hapus reminder "${r.title}"?`)) deleteReminder.mutate(r.id)
                  }}
                  onOpen={() => openDetail(r)}
                />
              ))}
          </div>
        )}
        {activeQuery.data?.meta && activeQuery.data.meta.last_page > 1 && (
          <div className="flex items-center justify-between text-sm">
            <Button
              variant="outline"
              size="sm"
              disabled={activePage <= 1 || activeQuery.isFetching}
              onClick={() => setActivePage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </Button>
            <span className="text-muted-foreground">
              Halaman {activeQuery.data.meta.current_page} dari {activeQuery.data.meta.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={activePage >= activeQuery.data.meta.last_page || activeQuery.isFetching}
              onClick={() => setActivePage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">Riwayat</h2>
        {historyQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Memuat riwayat...</p>
        ) : historyQuery.isError ? (
          <p className="text-sm text-red-600">Gagal memuat riwayat.</p>
        ) : (historyQuery.data?.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada riwayat.</p>
        ) : (
          <div className="space-y-3">
            {[...(historyQuery.data?.data ?? [])]
              .sort((a, b) => getLatestMillis(b) - getLatestMillis(a))
              .map((r) => (
                <ReminderCard
                  key={r.id}
                  reminder={r}
                  showEdit={false}
                  onDelete={() => {
                    if (window.confirm(`Hapus reminder "${r.title}"?`)) deleteReminder.mutate(r.id)
                  }}
                  onOpen={() => openDetail(r)}
                />
              ))}
          </div>
        )}
        {historyQuery.data?.meta && historyQuery.data.meta.last_page > 1 && (
          <div className="flex items-center justify-between text-sm">
            <Button
              variant="outline"
              size="sm"
              disabled={historyPage <= 1 || historyQuery.isFetching}
              onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </Button>
            <span className="text-muted-foreground">
              Halaman {historyQuery.data.meta.current_page} dari {historyQuery.data.meta.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={historyPage >= historyQuery.data.meta.last_page || historyQuery.isFetching}
              onClick={() => setHistoryPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        )}
      </section>

      <ReminderForm
        open={formOpen}
        onOpenChange={setFormOpen}
        farmId={farmId}
        reminder={editing}
      />
    </div>
  )
}
