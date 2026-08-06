import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateStaff } from '../hooks/useStaff'
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

interface StaffFormData {
  name: string
  username: string
  password: string
}

interface StaffFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  farmId: number
}

export function StaffForm({ open, onOpenChange, farmId }: StaffFormProps) {
  const createStaff = useCreateStaff()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<StaffFormData>({
    defaultValues: { name: '', username: '', password: '' },
  })

  useEffect(() => {
    if (open) reset({ name: '', username: '', password: '' })
  }, [open, reset])

  const onSubmit = (data: StaffFormData) => {
    createStaff.mutate({ farmId, ...data }, { onSuccess: () => onOpenChange(false) })
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
          <DialogTitle>Tambah Petugas</DialogTitle>
          <DialogDescription>Buat akun petugas untuk kebun ini.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama</Label>
            <Input id="name" {...register('name', { required: 'Nama wajib diisi' })} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register('username', { required: 'Username wajib diisi' })} />
            {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password', {
                required: 'Password wajib diisi',
                minLength: { value: 8, message: 'Password minimal 8 karakter' },
              })}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
          {createStaff.error && (
            <p className="text-sm text-red-500">
              {(createStaff.error as { message?: string }).message ?? 'Gagal membuat petugas.'}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Batal
            </DialogClose>
            <Button type="submit" disabled={createStaff.isPending}>
              {createStaff.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
