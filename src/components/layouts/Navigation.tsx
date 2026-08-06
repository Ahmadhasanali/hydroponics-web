import { Link } from '@tanstack/react-router'
import {
  BarChart3,
  Droplets,
  History,
  LayoutDashboard,
  User,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/farms', label: 'Farms', icon: Warehouse },
  { to: '/reports', label: 'Laporan', icon: BarChart3 },
  { to: '/activity', label: 'Aktivitas', icon: History },
  { to: '/profile', label: 'Profil', icon: User },
]

const rowLinkBase =
  'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors ' +
  'hover:bg-[#ffce54]/10 hover:text-[#1a1c1e]'

const columnLinkBase =
  'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold ' +
  'text-slate-500'

export function Sidebar() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 flex-col gap-1 overflow-y-auto border-r border-slate-200/80 p-3 md:flex">
      <div className="mb-4 flex items-center gap-3 px-2 pt-2">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ffce54] text-[#1a1c1e]">
          <Droplets className="size-5" />
        </span>
        <span className="text-base font-bold text-slate-900">HydroFarm</span>
      </div>
      <p className="px-3 pt-1 pb-2 text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
        Menu
      </p>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.exact ?? false }}
            className={rowLinkBase}
            activeProps={{ className: 'bg-[#ffce54]/15 text-[#1a1c1e]' }}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </aside>
  )
}

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="flex items-stretch">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact ?? false }}
              className={columnLinkBase}
              activeProps={{ className: 'text-[#d4a020]' }}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
