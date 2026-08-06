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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Outlet />
    </div>
  )
}