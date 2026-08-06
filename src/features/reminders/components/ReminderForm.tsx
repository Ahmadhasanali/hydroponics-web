import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { Recurrence, RecurrenceType, Reminder } from '../types'
import { useCreateReminder, useUpdateReminder } from '../hooks/useReminders'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../../../components/ui/dialog'

interface ReminderFormData {
  title: string
  body: string
  starts_at: string
  target_mode: 'self' | 'all'
  recurrence_type: RecurrenceType
  every_days: string
  days_of_week: string
  days_of_month: string
  advance_notify_minutes: string
}

interface ReminderFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  farmId: number
  reminder?: Reminder
}

const fieldClass =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30'

const textareaClass =
  'min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30'

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

function toLocalInput(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function buildRecurrence(data: ReminderFormData): Recurrence {
  if (data.recurrence_type === 'interval') {
    return { type: 'interval', every_days: Number(data.every_days) || 1 }
  }
  if (data.recurrence_type === 'weekly') {
    const days = data.days_of_week
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => WEEKDAYS.includes(s))
    if (days.length === 0) return { type: 'none' }
    return { type: 'weekly', days_of_week: days }
  }
  if (data.recurrence_type === 'monthly') {
    const days = data.days_of_month
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 31)
    if (days.length === 0) return { type: 'none' }
    return { type: 'monthly', days_of_month: days }
  }
  return { type: 'none' }
}

export function ReminderForm({ open, onOpenChange, farmId, reminder }: ReminderFormProps) {
  const createReminder = useCreateReminder()
  const updateReminder = useUpdateReminder()
  const isSubmitting = createReminder.isPending || updateReminder.isPending
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ReminderFormData>({
    defaultValues: {
      title: '',
      body: '',
      starts_at: '',
      target_mode: 'self',
      recurrence_type: 'none',
      every_days: '1',
      days_of_week: '',
      days_of_month: '',
      advance_notify_minutes: '',
    },
  })

  const recurrenceType = watch('recurrence_type')

  useEffect(() => {
    if (open) {
      reset({
        title: reminder?.title ?? '',
        body: reminder?.body ?? '',
        starts_at: toLocalInput(reminder?.starts_at),
        target_mode: 'self',
        recurrence_type: reminder?.recurrence?.type ?? 'none',
        every_days: reminder?.recurrence?.every_days ? String(reminder.recurrence.every_days) : '1',
        days_of_week: reminder?.recurrence?.days_of_week?.join(',') ?? '',
        days_of_month: reminder?.recurrence?.days_of_month?.join(',') ?? '',
        advance_notify_minutes: reminder?.advance_notify_minutes
          ? String(reminder.advance_notify_minutes)
          : '',
      })
    }
  }, [open, reminder, reset])

  const onSubmit = (data: ReminderFormData) => {
    const base = {
      title: data.title,
      body: data.body,
      starts_at: new Date(data.starts_at).toISOString(),
      recurrence: buildRecurrence(data),
      advance_notify_minutes: data.advance_notify_minutes
        ? Number(data.advance_notify_minutes)
        : undefined,
    }
    if (reminder) {
      updateReminder.mutate({ id: reminder.id, ...base }, { onSuccess: () => onOpenChange(false) })
    } else {
      createReminder.mutate(
        { ...base, farm_id: farmId, target_mode: data.target_mode },
        { onSuccess: () => onOpenChange(false) },
      )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) reset()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{reminder ? 'Edit Reminder' : 'Tambah Reminder'}</DialogTitle>
          <DialogDescription>
            {reminder ? 'Perbarui detail reminder.' : 'Buat pengingat baru untuk kebun ini.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Judul</Label>
            <Input id="title" {...register('title', { required: 'Judul wajib diisi' })} />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="body">Isi</Label>
            <textarea id="body" className={textareaClass} {...register('body', { required: 'Isi wajib diisi' })} />
            {errors.body && <p className="text-sm text-red-500">{errors.body.message}</p>}
          </div>
          <div>
            <Label htmlFor="starts_at">Waktu Mulai</Label>
            <Input
              id="starts_at"
              type="datetime-local"
              {...register('starts_at', { required: 'Waktu mulai wajib diisi' })}
            />
            {errors.starts_at && <p className="text-sm text-red-500">{errors.starts_at.message}</p>}
          </div>
          <div>
            <Label htmlFor="recurrence_type">Pengulangan</Label>
            <select id="recurrence_type" className={fieldClass} {...register('recurrence_type')}>
              <option value="none">Tidak berulang</option>
              <option value="interval">Setiap N hari</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
          </div>
          {recurrenceType === 'interval' && (
            <div>
              <Label htmlFor="every_days">Ulangi Setiap (hari)</Label>
              <Input
                id="every_days"
                type="number"
                min={1}
                {...register('every_days')}
              />
            </div>
          )}
          {recurrenceType === 'weekly' && (
            <div>
              <Label htmlFor="days_of_week">Hari dalam Seminggu</Label>
              <Input
                id="days_of_week"
                placeholder="mon,wed,fri"
                {...register('days_of_week')}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Pisahkan dengan koma (mon, tue, wed, thu, fri, sat, sun).
              </p>
            </div>
          )}
          {recurrenceType === 'monthly' && (
            <div>
              <Label htmlFor="days_of_month">Tanggal dalam Bulan</Label>
              <Input
                id="days_of_month"
                placeholder="1,15"
                {...register('days_of_month')}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Pisahkan dengan koma, contoh: 1,15.
              </p>
            </div>
          )}
          {!reminder && (
            <div>
              <Label htmlFor="target_mode">Target</Label>
              <select id="target_mode" className={fieldClass} {...register('target_mode')}>
                <option value="self">Hanya saya</option>
                <option value="all">Semua anggota kebun</option>
              </select>
            </div>
          )}
          <div>
            <Label htmlFor="advance_notify_minutes">Notifikasi Lebih Awal (menit)</Label>
            <Input
              id="advance_notify_minutes"
              type="number"
              min={1}
              placeholder="Opsional"
              {...register('advance_notify_minutes')}
            />
          </div>
          {createReminder.error && (
            <p className="text-sm text-red-500">
              {(createReminder.error as { message?: string }).message ?? 'Gagal menyimpan reminder.'}
            </p>
          )}
          {updateReminder.error && (
            <p className="text-sm text-red-500">
              {(updateReminder.error as { message?: string }).message ?? 'Gagal menyimpan reminder.'}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Batal
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : reminder ? 'Simpan' : 'Buat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
