import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { api } from '../../../lib/api'
import type { ApiResponse } from '../../../lib/types'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { DropletsIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const glassCard = 'w-full max-w-sm rounded-[1.75rem] border border-white/10 bg-white/10 shadow-2xl shadow-black/30 ring-0 backdrop-blur-2xl'

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
      setSuccess(res.message || 'Kami telah mengirim link reset password ke email Anda.')
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
        <CardTitle className="text-lg text-white">Lupa Kata Sandi</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-slate-300">Masukkan email Anda dan kami akan mengirimkan link untuk mengatur ulang kata sandi.</p>
          <div>
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input id="email" type="email" {...register('email', { required: 'Email wajib diisi' })} />
            {errors.email && <p className="text-rose-300 text-sm">{errors.email.message}</p>}
          </div>
          {error && <p className="text-rose-300 text-sm">{error}</p>}
          {success && <p className="text-[#a3c44a] text-sm">{success}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Memuat...' : 'Kirim Link Atur Ulang'}
          </Button>
        </form>
        <div className="mt-4 text-sm text-center">
          <p>Ingat kata sandi? <Link to="/login" className="text-[#ffce54] hover:text-[#f0b830]">Masuk</Link></p>
        </div>
      </CardContent>
    </Card>
  )
}
