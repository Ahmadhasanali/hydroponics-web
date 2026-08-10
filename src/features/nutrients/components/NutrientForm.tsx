import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { NutrientAddition, CreateNutrientInput, UpdateNutrientInput } from '../types'
import { useCreateNutrient, useUpdateNutrient } from '../hooks/useNutrients'
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

interface NutrientFormData {
  log_date: string
  ppm_before: string
  ppm_after: string
  nutrient_a_ml: string
  nutrient_b_ml: string
  notes?: string
}

interface NutrientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tankId: number
  record?: NutrientAddition
}

const today = new Date().toISOString().slice(0, 10)
const toStr = (n?: number) => (n === undefined || n === null ? '' : String(n))
const toDate = (s?: string) => (s ? s.slice(0, 10) : '')
const dateOrDefault = (s?: string) => toDate(s) || today

export function NutrientForm({ open, onOpenChange, tankId, record }: NutrientFormProps) {
  const createNutrient = useCreateNutrient()
  const updateNutrient = useUpdateNutrient()
  const isSubmitting = createNutrient.isPending || updateNutrient.isPending
  const { register, handleSubmit, reset } = useForm<NutrientFormData>({
    defaultValues: {
      log_date: dateOrDefault(record?.log_date),
      ppm_before: toStr(record?.ppm_before),
      ppm_after: toStr(record?.ppm_after),
      nutrient_a_ml: toStr(record?.nutrient_a_ml),
      nutrient_b_ml: toStr(record?.nutrient_b_ml),
      notes: record?.notes ?? '',
    },
  })
  const [warning, setWarning] = useState<string>('')

  useEffect(() => {
    if (open) {
      reset({
        log_date: dateOrDefault(record?.log_date),
        ppm_before: toStr(record?.ppm_before),
        ppm_after: toStr(record?.ppm_after),
        nutrient_a_ml: toStr(record?.nutrient_a_ml),
        nutrient_b_ml: toStr(record?.nutrient_b_ml),
        notes: record?.notes ?? '',
      })
      setWarning('')
    }
  }, [open, record, reset])

  const onSubmit = (data: NutrientFormData) => {
    const ppmBefore = Number(data.ppm_before)
    const ppmAfter = Number(data.ppm_after)

    if (!(ppmAfter > ppmBefore)) {
      setWarning('PPM setelah (ppm_after) harus lebih besar dari PPM sebelum (ppm_before).')
      return
    }

    const payload: CreateNutrientInput | UpdateNutrientInput = {
      tank_id: record?.tank_id ?? tankId,
      log_date: data.log_date,
      ppm_before: ppmBefore,
      ppm_after: ppmAfter,
      nutrient_a_ml: Number(data.nutrient_a_ml),
      nutrient_b_ml: Number(data.nutrient_b_ml),
      notes: data.notes,
    }
    const onDone = () => onOpenChange(false)
    if (record) {
      updateNutrient.mutate({ id: record.id, ...payload }, { onSuccess: onDone })
    } else {
      createNutrient.mutate(payload, { onSuccess: onDone })
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
          <DialogTitle>{record ? 'Edit AB Mix' : 'Catat AB Mix'}</DialogTitle>
          <DialogDescription>
            {record ? 'Perbarui data penambahan nutrisi.' : 'Catat penambahan nutrisi baru untuk tank ini.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {warning && (
            <p className="rounded-xl border border-warning/30 bg-warning/15 px-3 py-2 text-sm text-warning">
              {warning}
            </p>
          )}
          <div>
            <Label htmlFor="log_date">Tanggal</Label>
            <Input id="log_date" type="date" {...register('log_date', { required: 'Tanggal wajib diisi' })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ppm_before">PPM Sebelum</Label>
              <Input id="ppm_before" type="number" min={0} max={3000} step="any" {...register('ppm_before', { required: 'PPM sebelum wajib diisi' })} />
            </div>
            <div>
              <Label htmlFor="ppm_after">PPM Setelah</Label>
              <Input id="ppm_after" type="number" min={0} max={3000} step="any" {...register('ppm_after', { required: 'PPM setelah wajib diisi' })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="nutrient_a_ml">Nutrisi A (ml)</Label>
              <Input id="nutrient_a_ml" type="number" min={0} max={10000} step="any" {...register('nutrient_a_ml', { required: 'Nutrisi A wajib diisi' })} />
            </div>
            <div>
              <Label htmlFor="nutrient_b_ml">Nutrisi B (ml)</Label>
              <Input id="nutrient_b_ml" type="number" min={0} max={10000} step="any" {...register('nutrient_b_ml', { required: 'Nutrisi B wajib diisi' })} />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Catatan</Label>
            <Input id="notes" {...register('notes')} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Batal
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : record ? 'Simpan' : 'Buat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}