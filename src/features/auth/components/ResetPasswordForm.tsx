import { Link, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { api } from '../../../lib/api'
import type { ApiResponse } from '../../../lib/types'
import { AuthShell } from './AuthShell'
import { ErrorNote, Field, SuccessNote } from './field'

interface ResetPasswordData {
  email: string
  token: string
  password: string
  password_confirmation: string
}

interface ResetSearchParams {
  token?: string
  email?: string
}

export function ResetPasswordForm() {
  const { token, email } = useSearch({ strict: false }) as ResetSearchParams
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordData>({
    defaultValues: {
      token: token ?? '',
      email: email ?? '',
    },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const password = watch('password')

  const onSubmit = async (data: ResetPasswordData) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await api.post<ApiResponse<null>>('/password/reset', data)
      setSuccess(res.message || 'Kata sandi berhasil diatur ulang. Silakan masuk.')
    } catch (err) {
      setError((err as { message?: string })?.message || 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Pemulihan Akun"
      title="Buat kata sandi baru."
      description="Pilih kata sandi baru untuk akun Anda. Gunakan minimal delapan karakter."
      footer={
        <>
          <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Kembali ke masuk
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <input type="hidden" {...register('token')} />
        <input type="hidden" {...register('email')} />

        <Field label="Kata sandi baru" htmlFor="password" error={errors.password?.message}>
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

        {error && <ErrorNote>{error}</ErrorNote>}
        {success && <SuccessNote>{success}</SuccessNote>}

        <Button type="submit" size="lg" className="h-11 w-full rounded-sm text-sm" disabled={loading}>
          {loading ? 'Memproses…' : 'Atur ulang kata sandi'}
        </Button>
      </form>
    </AuthShell>
  )
}