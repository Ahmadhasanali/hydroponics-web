import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { PhDownLog, CreatePhDownInput, UpdatePhDownInput } from '../types'
import { useCreatePhDown, useUpdatePhDown } from '../hooks/usePhDown'
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

interface PhDownFormData {
  log_date: string
  ph_before: string
  ph_after: string
  ph_down_ml: string
  notes?: string
}

interface PhDownFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tankId: number
  record?: PhDownLog
}

const today = new Date().toISOString().slice(0, 10)
const toStr = (n?: number) => (n === undefined || n === null ? '' : String(n))
const toDate = (s?: string) => (s ? s.slice(0, 10) : '')

export function PhDownForm({ open, onOpenChange, tankId, record }: PhDownFormProps) {
  const createPhDown = useCreatePhDown()
  const updatePhDown = useUpdatePhDown()
  const isSubmitting = createPhDown.isPending || updatePhDown.isPending
  const { register, handleSubmit, reset } = useForm<PhDownFormData>({
    defaultValues: {
      log_date: toDate(record?.log_date) ?? today,
      ph_before: toStr(record?.ph_before),
      ph_after: toStr(record?.ph_after),
      ph_down_ml: toStr(record?.ph_down_ml),
      notes: record?.notes ?? '',
    },
  })
  const [warning, setWarning] = useState<string>('')

  useEffect(() => {
    if (open) {
      reset({
        log_date: toDate(record?.log_date) ?? today,
        ph_before: toStr(record?.ph_before),
        ph_after: toStr(record?.ph_after),
        ph_down_ml: toStr(record?.ph_down_ml),
        notes: record?.notes ?? '',
      })
      setWarning('')
    }
  }, [open, record, reset])

  const onSubmit = (data: PhDownFormData) => {
    const phBefore = Number(data.ph_before)
    const phAfter = Number(data.ph_after)

    if (!(phAfter < phBefore)) {
      setWarning('pH setelah (ph_after) harus lebih kecil dari pH sebelum (ph_before).')
      return
    }

    const payload: CreatePhDownInput | UpdatePhDownInput = {
      tank_id: record?.tank_id ?? tankId,
      log_date: data.log_date,
      ph_before: phBefore,
      ph_after: phAfter,
      ph_down_ml: Number(data.ph_down_ml),
      notes: data.notes,
    }
    const onDone = () => onOpenChange(false)
    if (record) {
      updatePhDown.mutate({ id: record.id, ...payload }, { onSuccess: onDone })
    } else {
      createPhDown.mutate(payload, { onSuccess: onDone })
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
          <DialogTitle>{record ? 'Edit pH Down' : 'Add pH Down'}</DialogTitle>
          <DialogDescription>
            {record ? 'Update the pH down record.' : 'Log a new pH down for this tank.'}
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
              <Label htmlFor="ph_before">pH Before</Label>
              <Input id="ph_before" type="number" min={0} max={14} step="any" {...register('ph_before', { required: 'pH sebelum wajib diisi' })} />
            </div>
            <div>
              <Label htmlFor="ph_after">pH After</Label>
              <Input id="ph_after" type="number" min={0} max={14} step="any" {...register('ph_after', { required: 'pH setelah wajib diisi' })} />
            </div>
          </div>
          <div>
            <Label htmlFor="ph_down_ml">pH Down (ml)</Label>
            <Input id="ph_down_ml" type="number" min={0} max={1000} step="any" {...register('ph_down_ml', { required: 'pH down wajib diisi' })} />
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