import { Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { useAuth } from '../../../hooks/useAuth'
import { AuthShell } from './AuthShell'
import { ErrorNote, Field } from './field'

interface RegisterFormData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export function RegisterForm() {
  const { register: doRegister, registerError, isRegistering } = useAuth()
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>()

  const password = watch('password')

  const onSubmit = (data: RegisterFormData) => doRegister(data)

  return (
    <AuthShell
      eyebrow="Buat Akun"
      title="Mulai memantau kebun Anda."
      description="Buat akun untuk mencatat tank, resep nutrisi, dan riwayat pertumbuhan secara langsung."
      footer={
        <>
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Field label="Nama" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Nama Anda"
            className="h-10 rounded-sm bg-background px-3 text-[15px]"
            aria-invalid={!!errors.name}
            {...register('name', { required: 'Nama wajib diisi' })}
          />
        </Field>

        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            className="h-10 rounded-sm bg-background px-3 text-[15px]"
            aria-invalid={!!errors.email}
            {...register('email', { required: 'Email wajib diisi' })}
          />
        </Field>

        <Field label="Kata sandi" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            className="h-10 rounded-sm bg-background px-3 text-[15px]"
            aria-invalid={!!errors.password}
            {...register('password', {
              required: 'Kata sandi wajib diisi',
              minLength: { value: 8, message: 'Kata sandi minimal 8 karakter' },
            })}
          />
        </Field>

        <Field label="Konfirmasi kata sandi" htmlFor="password_confirmation" error={errors.password_confirmation?.message}>
          <Input
            id="password_confirmation"
            type="password"
            autoComplete="new-password"
            placeholder="Ulangi kata sandi"
            className="h-10 rounded-sm bg-background px-3 text-[15px]"
            aria-invalid={!!errors.password_confirmation}
            {...register('password_confirmation', {
              required: 'Konfirmasi kata sandi wajib diisi',
              validate: (value) => value === password || 'Konfirmasi kata sandi tidak cocok',
            })}
          />
        </Field>

        {registerError && (
          <ErrorNote>{(registerError as { message: string }).message || 'Gagal mendaftar. Silakan coba lagi.'}</ErrorNote>
        )}

        <Button type="submit" size="lg" className="h-11 w-full rounded-sm text-sm" disabled={isRegistering}>
          {isRegistering ? 'Memproses…' : 'Daftar'}
        </Button>
      </form>
    </AuthShell>
  )
}