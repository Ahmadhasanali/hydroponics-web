import { createFileRoute, Link } from '@tanstack/react-router'
import {
  BarChart3,
  History,
  Landmark,
  LogOut,
  Send,
  ShoppingCart,
  User,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ThemeToggle } from '../../components/theme/ThemeToggle'
import { Button } from '../../components/ui/button'

export const Route = createFileRoute('/_authenticated/more')({
  component: MorePage,
})

const MORE_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/sales', label: 'Penjualan', icon: ShoppingCart },
  { to: '/finance', label: 'Keuangan', icon: Wallet },
  { to: '/accounts', label: 'Akun', icon: Landmark },
  { to: '/reports', label: 'Laporan', icon: BarChart3 },
  { to: '/activity', label: 'Aktivitas', icon: History },
  { to: '/profile', label: 'Profil', icon: User },
  { to: '/settings/telegram', label: 'Telegram', icon: Send },
]

function MorePage() {
  const { user, logout } = useAuth()

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Lainnya</h1>
        <p className="text-sm text-muted-foreground">Menu dan pengaturan aplikasi.</p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
          <User className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{user?.name ?? 'Pengguna'}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      <div className="grid gap-2">
        {MORE_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-secondary/10"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                <Icon className="size-5" />
              </span>
              <span className="text-sm font-semibold text-foreground">{item.label}</span>
            </Link>
          )
        })}
      </div>

      <Button
        variant="destructive"
        className="w-full"
        onClick={() => logout()}
      >
        <LogOut className="size-4" />
        Keluar
      </Button>
    </div>
  )
}
