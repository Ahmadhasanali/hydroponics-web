import { useForm } from 'react-hook-form'
import { useAuth } from '../../../hooks/useAuth'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Link } from '@tanstack/react-router'

interface RegisterFormData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export function RegisterForm() {
  const { register, registerError, isRegistering } = useAuth()
  const { register: field, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>()

  const password = watch('password')

  const onSubmit = (data: RegisterFormData) => register(data)

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Daftar</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama</Label>
            <Input id="name" type="text" {...field('name', { required: 'Nama wajib diisi' })} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...field('email', { required: 'Email wajib diisi' })} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...field('password', { required: 'Password wajib diisi', minLength: { value: 8, message: 'Password minimal 8 karakter' } })} />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>
          <div>
            <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
            <Input id="password_confirmation" type="password" {...field('password_confirmation', {
              required: 'Konfirmasi password wajib diisi',
              validate: (value) => value === password || 'Konfirmasi password tidak cocok',
            })} />
            {errors.password_confirmation && <p className="text-red-500 text-sm">{errors.password_confirmation.message}</p>}
          </div>
          {registerError && <p className="text-red-500 text-sm">{(registerError as { message: string }).message}</p>}
          <Button type="submit" className="w-full" disabled={isRegistering}>
            {isRegistering ? 'Loading...' : 'Daftar'}
          </Button>
        </form>
        <div className="mt-4 text-sm text-center">
          <p>Sudah punya akun? <Link to="/login" className="text-blue-600">Masuk</Link></p>
        </div>
      </CardContent>
    </Card>
  )
}