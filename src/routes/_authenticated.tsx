import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { BottomNav, Sidebar } from '../components/layouts/Navigation'
import { ChatWidget } from '../features/chat/components/ChatWidget'
import { usePushNotifications } from '../hooks/usePushNotifications'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    if (!localStorage.getItem('auth_token')) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  usePushNotifications()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 h-14 border-b bg-background/95 backdrop-blur">
        <div className="flex h-full items-center gap-3 px-4">
          <Link to="/" className="text-sm font-medium">
            HydroFarm
          </Link>
        </div>
      </header>
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-24 md:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <ChatWidget />
    </div>
  )
}