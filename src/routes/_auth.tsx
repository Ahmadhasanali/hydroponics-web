import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    if (localStorage.getItem('auth_token')) {
      throw redirect({ to: '/' })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="auth-shell flex min-h-screen items-center justify-center p-4 antialiased">
      <Outlet />
    </div>
  )
}