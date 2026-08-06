import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { api } from '../../../lib/api'
import type { ApiResponse } from '../../../lib/types'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Link } from '@tanstack/react-router'

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
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Lupa Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-gray-600">Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.</p>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email', { required: 'Email wajib diisi' })} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : 'Kirim Link Reset'}
          </Button>
        </form>
        <div className="mt-4 text-sm text-center">
          <p>Ingat password? <Link to="/login" className="text-blue-600">Masuk</Link></p>
        </div>
      </CardContent>
    </Card>
  )
}