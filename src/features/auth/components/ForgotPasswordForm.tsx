import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { api } from '../../../lib/api'
import type { ApiResponse } from '../../../lib/types'
import { AuthShell } from './AuthShell'
import { ErrorNote, Field, SuccessNote } from './field'

interface ForgotPasswordData {
  email: string
}

export function ForgotPasswordForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordData>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onSubmit = async (data: ForgotPasswordData) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await api.post<ApiResponse<null>>('/password/forgot', data)
      setSuccess(res.message || 'Kami telah mengirim link reset kata sandi ke email Anda.')
    } catch (err) {
      setError((err as { message?: string })?.message || 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Pemulihan Akun"
      title="Atur ulang kata sandi."
      description="Masukkan email terdaftar dan kami akan mengirimkan tautan untuk membuat kata sandi baru."
      footer={
        <>
          Ingat kata sandi?{' '}
          <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Masuk
          </Link>
        </>
      }
    >
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

        {error && <ErrorNote>{error}</ErrorNote>}
        {success && <SuccessNote>{success}</SuccessNote>}

        <Button type="submit" size="lg" className="h-11 w-full rounded-sm text-sm" disabled={loading}>
          {loading ? 'Mengirim…' : 'Kirim tautan atur ulang'}
        </Button>
      </form>
    </AuthShell>
  )
}