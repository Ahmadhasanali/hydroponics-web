import { createFileRoute, Link, Outlet, redirect, useLocation } from '@tanstack/react-router'
import { BottomNav, Sidebar } from '../components/layouts/Navigation'
import { ChatWidget } from '../features/chat/components/ChatWidget'
import { usePushNotifications } from '../hooks/usePushNotifications'
import { useAuth } from '../hooks/useAuth'
import { DropletsIcon } from 'lucide-react'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    if (!localStorage.getItem('auth_token')) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/farms': 'Farms',
  '/reports': 'Laporan',
  '/activity': 'Aktivitas',
  '/profile': 'Profil',
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function topTitle(pathname: string): string {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (TITLES[path]) return TITLES[path]
  const segs = path.split('/').filter(Boolean)
  if (segs[0] === 'farms') {
    const tankIndex = segs.indexOf('tanks')
    if (tankIndex !== -1) {
      const rest = segs.slice(tankIndex + 1)
      if (rest.length === 1) return 'Tank Detail'
      if (rest.length >= 2) return capitalize(rest[1].replace(/-/g, ' '))
      return 'Tanks'
    }
    return capitalize(segs[2] ?? 'Detail Farm')
  }
  return capitalize(segs[segs.length - 1]?.replace(/-/g, ' ') ?? '')
}

function AppLayout() {
  usePushNotifications()
  const { user } = useAuth()
  const { pathname } = useLocation()
  const title = topTitle(pathname)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 bg-white/90 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
        <div className="flex h-full items-center gap-3 px-4">
          <Link to="/" className="flex shrink-0 items-center gap-2 md:hidden">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffce54] text-[#1a1c1e]">
              <DropletsIcon className="size-5" />
            </span>
            <span className="text-sm font-bold text-slate-900">HydroFarm</span>
          </Link>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] leading-none font-medium tracking-[0.24em] text-[#d4a020] uppercase">
              HydroFarm
            </p>
            <h1 className="mt-1 truncate text-xl leading-none font-semibold text-slate-900">
              {title}
            </h1>
          </div>

          <span className="hidden shrink-0 rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 md:inline-block">
            {user?.name ?? 'Pengguna'}
          </span>
        </div>
      </header>
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 p-4 pb-24 md:p-6 md:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <ChatWidget />
    </div>
  )
}
