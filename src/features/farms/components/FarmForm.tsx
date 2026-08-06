import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { Farm } from '../../../lib/types'
import { useCreateFarm, useUpdateFarm } from '../hooks/useFarms'
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

interface FarmFormData {
  name: string
  location: string
}

interface FarmFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  farm?: Farm
}

export function FarmForm({ open, onOpenChange, farm }: FarmFormProps) {
  const createFarm = useCreateFarm()
  const updateFarm = useUpdateFarm()
  const isSubmitting = createFarm.isPending || updateFarm.isPending
  const { register, handleSubmit, reset } = useForm<FarmFormData>({
    defaultValues: { name: farm?.name ?? '', location: farm?.location ?? '' },
  })

  useEffect(() => {
    if (open) {
      reset({ name: farm?.name ?? '', location: farm?.location ?? '' })
    }
  }, [open, farm, reset])

  const onSubmit = (data: FarmFormData) => {
    if (farm) {
      updateFarm.mutate(
        { id: farm.id, ...data },
        { onSuccess: () => onOpenChange(false) },
      )
    } else {
      createFarm.mutate(data, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => {
      onOpenChange(o)
      if (!o) reset()
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{farm ? 'Edit Farm' : 'Create Farm'}</DialogTitle>
          <DialogDescription>
            {farm ? 'Update the farm details.' : 'Add a new farm to your workspace.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name', { required: 'Nama wajib diisi' })} />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register('location')} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : farm ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}