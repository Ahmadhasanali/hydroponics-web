import { useForm } from 'react-hook-form'
import { useAuth } from '../../../hooks/useAuth'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { DropletsIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const glassCard = 'w-full max-w-sm rounded-[1.75rem] border border-white/10 bg-white/10 shadow-2xl shadow-black/30 ring-0 backdrop-blur-2xl'

interface LoginFormData {
  email: string
  password: string
}

export function LoginForm() {
  const { login, loginError, isLoggingIn } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()

  const onSubmit = (data: LoginFormData) => login(data)

  return (
    <Card className={glassCard}>
      <CardHeader className="items-center gap-3 pt-8 text-center">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ffce54] text-[#1a1c1e]">
          <DropletsIcon className="size-5" />
        </div>
        <CardTitle className="text-lg text-white">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input id="email" type="email" {...register('email', { required: 'Email wajib diisi' })} />
            {errors.email && <p className="text-rose-300 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input id="password" type="password" {...register('password', { required: 'Password wajib diisi' })} />
            {errors.password && <p className="text-rose-300 text-sm">{errors.password.message}</p>}
          </div>
          {loginError && <p className="text-rose-300 text-sm">{(loginError as { message: string }).message}</p>}
          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn ? 'Loading...' : 'Login'}
          </Button>
        </form>
        <div className="mt-4 text-sm text-center space-y-1">
          <p><Link to="/forgot-password" className="text-[#ffce54] hover:text-[#f0b830]">Lupa password?</Link></p>
          <p>Belum punya akun? <Link to="/register" className="text-[#ffce54] hover:text-[#f0b830]">Daftar</Link></p>
        </div>
      </CardContent>
    </Card>
  )
}
