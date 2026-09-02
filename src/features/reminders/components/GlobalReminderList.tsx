import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Reminder } from '../types'
import { useGlobalReminders } from '../hooks/useReminders'
import { useFarms } from '../../farms/hooks/useFarms'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { ReminderForm } from './ReminderForm'
import { ReminderFarmPickerDialog } from './ReminderFarmPickerDialog'

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

function ReminderCard({ reminder, onOpen }: { reminder: Reminder; onOpen: () => void }) {
  return (
    <Card className="cursor-pointer transition-colors hover:bg-secondary/5" onClick={onOpen}>
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
          {reminder.body && <p className="text-sm text-muted-foreground">{reminder.body}</p>}
          <p className="text-xs text-muted-foreground">{formatDate(reminder.starts_at)}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function GlobalReminderList() {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const activeQuery = useGlobalReminders(activePage, 'aktif')
  const historyQuery = useGlobalReminders(historyPage, 'riwayat')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [formFarmId, setFormFarmId] = useState<number | null>(null)
  const { data: farms } = useFarms()

  const openNewReminder = () => {
    const list = farms ?? []
    if (list.length === 1) {
      setFormFarmId(list[0].id)
      setFormOpen(true)
      return
    }
    setPickerOpen(true)
  }

  const openDetail = (r: Reminder) =>
    navigate({
      to: '/farms/$farmId/reminders/$reminderId',
      params: { farmId: String(r.farm_id), reminderId: String(r.id) },
    })

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={openNewReminder}>Tambah Pengingat</Button>
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
          [...(activeQuery.data?.data ?? [])]
            .sort((a, b) => getNearestMillis(a) - getNearestMillis(b))
            .map((reminder: Reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} onOpen={() => openDetail(reminder)} />
            ))
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
          [...(historyQuery.data?.data ?? [])]
            .sort((a, b) => getLatestMillis(b) - getLatestMillis(a))
            .map((reminder: Reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} onOpen={() => openDetail(reminder)} />
            ))
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

      <ReminderFarmPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(farmId) => {
          setPickerOpen(false)
          setFormFarmId(farmId)
          setFormOpen(true)
        }}
      />
      {formFarmId !== null && <ReminderForm open={formOpen} onOpenChange={setFormOpen} farmId={formFarmId} />}
    </div>
  )
}
