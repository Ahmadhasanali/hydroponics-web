import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { ChatWidget } from '../features/chat/components/ChatWidget'

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
      <ChatWidget />
    </div>
  )
}