import { useForm } from 'react-hook-form'
import { useAuth } from '../../../hooks/useAuth'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { DropletsIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const glassCard = 'w-full max-w-sm rounded-[1.75rem] border border-white/10 bg-white/10 shadow-2xl shadow-black/30 ring-0 backdrop-blur-2xl'

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
    <Card className={glassCard}>
      <CardHeader className="items-center gap-3 pt-8 text-center">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          <DropletsIcon className="size-5" />
        </div>
        <CardTitle className="text-lg text-white">Daftar</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Nama</Label>
            <Input id="name" type="text" {...field('name', { required: 'Nama wajib diisi' })} />
            {errors.name && <p className="text-rose-300 text-sm">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input id="email" type="email" {...field('email', { required: 'Email wajib diisi' })} />
            {errors.email && <p className="text-rose-300 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password" className="text-white">Kata Sandi</Label>
            <Input id="password" type="password" {...field('password', { required: 'Kata sandi wajib diisi', minLength: { value: 8, message: 'Kata sandi minimal 8 karakter' } })} />
            {errors.password && <p className="text-rose-300 text-sm">{errors.password.message}</p>}
          </div>
          <div>
            <Label htmlFor="password_confirmation" className="text-white">Konfirmasi Kata Sandi</Label>
            <Input id="password_confirmation" type="password" {...field('password_confirmation', {
              required: 'Konfirmasi kata sandi wajib diisi',
              validate: (value) => value === password || 'Konfirmasi kata sandi tidak cocok',
            })} />
            {errors.password_confirmation && <p className="text-rose-300 text-sm">{errors.password_confirmation.message}</p>}
          </div>
          {registerError && <p className="text-rose-300 text-sm">{(registerError as { message: string }).message}</p>}
          <Button type="submit" className="w-full" disabled={isRegistering}>
            {isRegistering ? 'Memuat...' : 'Daftar'}
          </Button>
        </form>
        <div className="mt-4 text-sm text-center">
          <p>Sudah punya akun? <Link to="/login" className="text-secondary hover:text-foreground">Masuk</Link></p>
        </div>
      </CardContent>
    </Card>
  )
}
