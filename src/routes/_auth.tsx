import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    if (localStorage.getItem('auth_token')) {
      throw redirect({ to: '/' })
    }
  },
  component: () => <Outlet />,
})