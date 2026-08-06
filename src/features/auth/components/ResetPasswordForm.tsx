import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSearch } from '@tanstack/react-router'
import { api } from '../../../lib/api'
import type { ApiResponse } from '../../../lib/types'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { DropletsIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const glassCard = 'w-full max-w-sm rounded-[1.75rem] border border-white/10 bg-white/10 shadow-2xl shadow-black/30 ring-0 backdrop-blur-2xl'

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
      setSuccess(res.message || 'Password berhasil direset. Silakan login.')
    } catch (err) {
      setError((err as { message?: string })?.message || 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={glassCard}>
      <CardHeader className="items-center gap-3 pt-8 text-center">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ffce54] text-[#1a1c1e]">
          <DropletsIcon className="size-5" />
        </div>
        <CardTitle className="text-lg text-white">Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('token')} />
          <div>
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input id="email" type="email" {...register('email', { required: 'Email wajib diisi' })} />
            {errors.email && <p className="text-rose-300 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password" className="text-white">Password Baru</Label>
            <Input id="password" type="password" {...register('password', { required: 'Password wajib diisi', minLength: { value: 8, message: 'Password minimal 8 karakter' } })} />
            {errors.password && <p className="text-rose-300 text-sm">{errors.password.message}</p>}
          </div>
          <div>
            <Label htmlFor="password_confirmation" className="text-white">Konfirmasi Password</Label>
            <Input id="password_confirmation" type="password" {...register('password_confirmation', {
              required: 'Konfirmasi password wajib diisi',
              validate: (value) => value === password || 'Konfirmasi password tidak cocok',
            })} />
            {errors.password_confirmation && <p className="text-rose-300 text-sm">{errors.password_confirmation.message}</p>}
          </div>
          {error && <p className="text-rose-300 text-sm">{error}</p>}
          {success && <p className="text-[#a3c44a] text-sm">{success}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : 'Reset Password'}
          </Button>
        </form>
        <div className="mt-4 text-sm text-center">
          <p><Link to="/login" className="text-[#ffce54] hover:text-[#f0b830]">Kembali ke Login</Link></p>
        </div>
      </CardContent>
    </Card>
  )
}
