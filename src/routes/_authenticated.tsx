import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    if (!localStorage.getItem('auth_token')) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}