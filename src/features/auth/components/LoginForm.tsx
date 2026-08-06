import { useForm } from 'react-hook-form'
import { useAuth } from '../../../hooks/useAuth'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Link } from '@tanstack/react-router'

interface LoginFormData {
  email: string
  password: string
}

export function LoginForm() {
  const { login, loginError, isLoggingIn } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()

  const onSubmit = (data: LoginFormData) => login(data)

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email', { required: 'Email wajib diisi' })} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password', { required: 'Password wajib diisi' })} />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>
          {loginError && <p className="text-red-500 text-sm">{(loginError as { message: string }).message}</p>}
          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn ? 'Loading...' : 'Login'}
          </Button>
        </form>
        <div className="mt-4 text-sm text-center space-y-1">
          <p><Link to="/forgot-password" className="text-blue-600">Lupa password?</Link></p>
          <p>Belum punya akun? <Link to="/register" className="text-blue-600">Daftar</Link></p>
        </div>
      </CardContent>
    </Card>
  )
}