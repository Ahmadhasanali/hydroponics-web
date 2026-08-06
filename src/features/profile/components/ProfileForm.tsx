import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../../hooks/useAuth'
import { useUpdateProfile } from '../hooks/useProfile'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'

interface ProfileFormData {
  name: string
  email: string
}

export function ProfileForm() {
  const { user } = useAuth()
  const updateProfile = useUpdateProfile()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  })

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email })
    }
  }, [user, reset])

  const onSubmit = (data: ProfileFormData) => {
    updateProfile.mutate(data, {
      onSuccess: () => reset(data),
    })
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Perbarui nama dan email akun Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama</Label>
            <Input id="name" type="text" {...register('name', { required: 'Nama wajib diisi' })} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email', { required: 'Email wajib diisi' })} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          {updateProfile.error && (
            <p className="text-sm text-red-600">
              {(updateProfile.error as { message?: string }).message ?? 'Gagal memperbarui profil.'}
            </p>
          )}
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
