import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useResetStaffPassword } from '../hooks/useStaff'
import type { Staff } from '../types'
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

interface PasswordFormData {
  password: string
}

interface StaffPasswordDialogProps {
  farmId: number
  target: Staff | null
  onClose: () => void
}

export function StaffPasswordDialog({ farmId, target, onClose }: StaffPasswordDialogProps) {
  const resetPassword = useResetStaffPassword()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormData>({
    defaultValues: { password: '' },
  })

  useEffect(() => {
    if (target) reset({ password: '' })
  }, [target, reset])

  const onSubmit = (data: PasswordFormData) => {
    if (!target) return
    resetPassword.mutate(
      { farmId, staffId: target.id, password: data.password },
      { onSuccess: onClose },
    )
  }

  return (
    <Dialog
      open={!!target}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            {target ? `Set password baru untuk ${target.name}.` : ''}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="password">Password Baru</Label>
            <Input
              id="password"
              type="password"
              {...register('password', {
                required: 'Password wajib diisi',
                minLength: { value: 8, message: 'Password minimal 8 karakter' },
              })}
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
          {resetPassword.error && (
            <p className="text-sm text-red-600">
              {(resetPassword.error as { message?: string }).message ?? 'Gagal mereset password.'}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Batal
            </DialogClose>
            <Button type="submit" disabled={resetPassword.isPending}>
              {resetPassword.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
