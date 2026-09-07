import { Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { useAuth } from '../../../hooks/useAuth'
import { AuthShell } from './AuthShell'
import { ErrorNote, Field } from './field'

interface LoginFormData {
  email: string
  password: string
}

export function LoginForm() {
  const { login, loginError, isLoggingIn } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()

  const onSubmit = (data: LoginFormData) => login(data)

  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'
  const demoEmail = import.meta.env.VITE_DEMO_EMAIL || 'demo@hydrofarm.id'
  const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || 'demo123456'

  return (
    <AuthShell
      eyebrow="Akses Sistem"
      title="Masuk ke dasbor."
      description="Pantau pH, nutrisi, dan kondisi tank hidroponik Anda dalam satu tempat."
      footer={
        isDemoMode ? (
          <>Mode demo — data direset tiap jam, jangan pakai data asli.</>
        ) : (
          <>
            Belum punya akun?{' '}
            <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
              Daftar
            </Link>
          </>
        )
      }
    >
      {isDemoMode && (
        <div className="mb-5 rounded-md border border-dashed border-border bg-muted/50 px-3 py-2.5 text-[13px] leading-relaxed text-muted-foreground">
          Mode demo aktif. Gunakan tombol 1-klik di bawah, pendaftaran akun baru dinonaktifkan.
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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

        <Field
          label="Kata sandi"
          htmlFor="password"
          error={errors.password?.message}
          hint={
            <Link
              to="/forgot-password"
              className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Lupa kata sandi?
            </Link>
          }
        >
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-10 rounded-sm bg-background px-3 text-[15px]"
            aria-invalid={!!errors.password}
            {...register('password', { required: 'Kata sandi wajib diisi' })}
          />
        </Field>

        {loginError && (
          <ErrorNote>{(loginError as { message: string }).message || 'Gagal masuk. Periksa kembali email dan kata sandi.'}</ErrorNote>
        )}

        <Button type="submit" size="lg" className="h-11 w-full rounded-sm text-sm" disabled={isLoggingIn}>
          {isLoggingIn ? 'Memproses…' : 'Masuk'}
        </Button>

        {isDemoMode && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="h-11 w-full rounded-sm text-sm"
            disabled={isLoggingIn}
            onClick={() => login({ email: demoEmail, password: demoPassword })}
          >
            Coba Demo 1-Klik
          </Button>
        )}
      </form>
    </AuthShell>
  )
}