import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { DailyMonitoring, CreateMonitoringInput, UpdateMonitoringInput } from '../types'
import { useCreateMonitoring, useUpdateMonitoring } from '../hooks/useMonitoring'
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

interface MonitoringFormData {
  log_date: string
  ppm: string
  ph: string
  water_temperature?: string
  notes?: string
}

interface MonitoringFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tankId: number
  record?: DailyMonitoring
}

const today = new Date().toISOString().slice(0, 10)
const toStr = (s?: number) => (s === undefined || s === null ? '' : String(s))
const toDate = (s?: string) => (s ? s.slice(0, 10) : '')
const dateOrDefault = (s?: string) => toDate(s) || today

export function MonitoringForm({ open, onOpenChange, tankId, record }: MonitoringFormProps) {
  const createMonitoring = useCreateMonitoring()
  const updateMonitoring = useUpdateMonitoring()
  const isSubmitting = createMonitoring.isPending || updateMonitoring.isPending
  const { register, handleSubmit, reset } = useForm<MonitoringFormData>({
    defaultValues: {
      log_date: dateOrDefault(record?.log_date),
      ppm: toStr(record?.ppm),
      ph: toStr(record?.ph),
      water_temperature: toStr(record?.water_temperature),
      notes: record?.notes ?? '',
    },
  })
  const [warning, setWarning] = useState<string>('')

  useEffect(() => {
    if (open) {
      reset({
        log_date: dateOrDefault(record?.log_date),
        ppm: toStr(record?.ppm),
        ph: toStr(record?.ph),
        water_temperature: toStr(record?.water_temperature),
        notes: record?.notes ?? '',
      })
      setWarning('')
    }
  }, [open, record, reset])

  const parseNumber = (s?: string) => (s === undefined || s === '' ? undefined : Number(s))

  const onSubmit = (data: MonitoringFormData) => {
    const payload: CreateMonitoringInput | UpdateMonitoringInput = {
      tank_id: record?.tank_id ?? tankId,
      log_date: data.log_date,
      ppm: Number(data.ppm),
      ph: Number(data.ph),
      water_temperature: parseNumber(data.water_temperature),
      notes: data.notes,
    }
    const onDone = (res: { warnings?: string }) => {
      if (res.warnings) setWarning(res.warnings)
      onOpenChange(false)
    }
    if (record) {
      updateMonitoring.mutate({ id: record.id, ...payload }, { onSuccess: onDone })
    } else {
      createMonitoring.mutate(payload, { onSuccess: onDone })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) setWarning('')
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{record ? 'Edit Monitoring' : 'Create Monitoring'}</DialogTitle>
          <DialogDescription>
            {record ? 'Update the monitoring record.' : 'Add a new monitoring reading for this tank.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {warning && (
            <p className="rounded-xl border border-[#ffce54]/30 bg-[#ffce54]/15 px-3 py-2 text-sm text-[#a07a10]">
              {warning}
            </p>
          )}
          <div>
            <Label htmlFor="log_date">Log Date</Label>
            <Input id="log_date" type="date" {...register('log_date', { required: 'Tanggal wajib diisi' })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ppm">PPM</Label>
              <Input id="ppm" type="number" min={0} max={3000} step="any" {...register('ppm', { required: 'PPM wajib diisi' })} />
            </div>
            <div>
              <Label htmlFor="ph">pH</Label>
              <Input id="ph" type="number" min={0} max={14} step="any" {...register('ph', { required: 'pH wajib diisi' })} />
            </div>
          </div>
          <div>
            <Label htmlFor="water_temperature">Water Temperature (°C)</Label>
            <Input id="water_temperature" type="number" min={-10} max={60} step="any" {...register('water_temperature')} />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...register('notes')} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : record ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}