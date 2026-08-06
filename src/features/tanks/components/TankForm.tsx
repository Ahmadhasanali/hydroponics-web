import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { CreateTankInput, UpdateTankInput } from '../types'
import { useCreateTank, useUpdateTank } from '../hooks/useTanks'
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

interface TankFormData {
  name: string
  capacity_liter: string
  notes?: string
  target_ppm_min?: string
  target_ppm_max?: string
  target_ph_min?: string
  target_ph_max?: string
}

interface TankFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  farmId: number
  tank?: {
    id: number
    name: string
    capacity_liter: number
    notes?: string
    target_ppm_min?: number
    target_ppm_max?: number
    target_ph_min?: number
    target_ph_max?: number
    is_active: boolean
  }
}

const toStr = (s?: number) => (s === undefined || s === null ? '' : String(s))

export function TankForm({ open, onOpenChange, farmId, tank }: TankFormProps) {
  const createTank = useCreateTank()
  const updateTank = useUpdateTank()
  const isSubmitting = createTank.isPending || updateTank.isPending
  const { register, handleSubmit, reset } = useForm<TankFormData>({
    defaultValues: {
      name: tank?.name ?? '',
      capacity_liter: tank ? String(tank.capacity_liter) : '',
      notes: tank?.notes ?? '',
      target_ppm_min: toStr(tank?.target_ppm_min),
      target_ppm_max: toStr(tank?.target_ppm_max),
      target_ph_min: toStr(tank?.target_ph_min),
      target_ph_max: toStr(tank?.target_ph_max),
    },
  })
  const [isActive, setIsActive] = useState(tank?.is_active ?? true)

  useEffect(() => {
    if (open) {
      reset({
        name: tank?.name ?? '',
        capacity_liter: tank ? String(tank.capacity_liter) : '',
        notes: tank?.notes ?? '',
        target_ppm_min: toStr(tank?.target_ppm_min),
        target_ppm_max: toStr(tank?.target_ppm_max),
        target_ph_min: toStr(tank?.target_ph_min),
        target_ph_max: toStr(tank?.target_ph_max),
      })
      setIsActive(tank?.is_active ?? true)
    }
  }, [open, tank, reset])

  const parseNumber = (s?: string) => (s === undefined || s === '' ? undefined : Number(s))

  const onSubmit = (data: TankFormData) => {
    const payload: CreateTankInput | UpdateTankInput = {
      name: data.name,
      capacity_liter: Number(data.capacity_liter),
      notes: data.notes,
      target_ppm_min: parseNumber(data.target_ppm_min),
      target_ppm_max: parseNumber(data.target_ppm_max),
      target_ph_min: parseNumber(data.target_ph_min),
      target_ph_max: parseNumber(data.target_ph_max),
      is_active: isActive,
    }
    if (tank) {
      updateTank.mutate({ id: tank.id, ...payload }, { onSuccess: () => onOpenChange(false) })
    } else {
      createTank.mutate({ ...payload, farm_id: farmId }, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tank ? 'Edit Tank' : 'Create Tank'}</DialogTitle>
          <DialogDescription>
            {tank ? 'Update the tank details.' : 'Add a new tank to this farm.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name', { required: 'Nama wajib diisi' })} />
            </div>
            <div>
              <Label htmlFor="capacity_liter">Capacity (L)</Label>
              <Input
                id="capacity_liter"
                type="number"
                min={0}
                step="any"
                {...register('capacity_liter', { required: 'Kapasitas wajib diisi' })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...register('notes')} />
          </div>

          <div className="space-y-2">
            <Label>Target PPM</Label>
            <div className="flex items-center gap-2">
              <Input id="target_ppm_min" type="number" min={0} max={3000} placeholder="Min" {...register('target_ppm_min')} />
              <span className="text-muted-foreground">–</span>
              <Input type="number" min={0} max={3000} placeholder="Max" {...register('target_ppm_max')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target pH</Label>
            <div className="flex items-center gap-2">
              <Input type="number" min={0} max={14} step="any" placeholder="Min" {...register('target_ph_min')} />
              <span className="text-muted-foreground">–</span>
              <Input type="number" min={0} max={14} step="any" placeholder="Max" {...register('target_ph_max')} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Active</Label>
            <Button
              type="button"
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsActive(!isActive)}
              aria-pressed={isActive}
            >
              {isActive ? 'Active' : 'Inactive'}
            </Button>
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : tank ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}