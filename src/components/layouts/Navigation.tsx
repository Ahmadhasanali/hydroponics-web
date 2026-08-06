import { Link } from '@tanstack/react-router'
import {
  BarChart3,
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
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ' +
  'text-muted-foreground hover:bg-muted hover:text-foreground'

const columnLinkBase =
  'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ' +
  'text-muted-foreground'

export function Sidebar() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 flex-col gap-1 overflow-y-auto border-r p-3 md:flex">
      <p className="px-3 pt-1 pb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
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
            activeProps={{ className: 'bg-muted text-foreground' }}
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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="flex items-stretch">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact ?? false }}
              className={columnLinkBase}
              activeProps={{ className: 'text-primary' }}
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
