import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { Button } from '../components/ui/button'
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
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <Link to="/" className="text-sm font-medium">
            HydroFarm
          </Link>
          <nav className="flex items-center gap-1">
            <Link to="/activity">
              <Button variant="ghost" size="sm">Aktivitas</Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" size="sm">Profil</Button>
            </Link>
          </nav>
        </div>
      </header>
      <Outlet />
      <ChatWidget />
    </div>
  )
}