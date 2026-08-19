import { Link } from '@tanstack/react-router'
import { History, User, BarChart3, type LucideIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog'

const SETTINGS_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/profile', label: 'Profil', icon: User },
  { to: '/activity', label: 'Activity Log', icon: History },
  { to: '/reports', label: 'Laporan', icon: BarChart3 },
]

export function SettingsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="bottom-0 top-auto left-1/2 -translate-x-1/2 translate-y-0 rounded-b-none sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-b-xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Kelola profil, aktivitas, dan laporan.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {SETTINGS_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => onOpenChange(false)}
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
      </DialogContent>
    </Dialog>
  )
}
