import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  BarChart3,
  Droplets,
  FlaskConical,
  History,
  LayoutDashboard,
  Plus,
  Thermometer,
  User,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { useFarms } from '../../features/farms/hooks/useFarms'
import { useTanks } from '../../features/tanks/hooks/useTanks'

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

type RecordKind = 'monitoring' | 'nutrients' | 'ph-down'

type RecordAction = {
  label: string
  description: string
  icon: LucideIcon
  kind: RecordKind
}

function RecordSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate()
  const { data: farms } = useFarms()
  const firstFarmId = farms?.[0]?.id
  const { data: tanks } = useTanks(firstFarmId ?? 0)

  const firstTankId = tanks?.[0]?.id

  const goToRecord = (kind: RecordKind) => {
    onOpenChange(false)
    if (!firstTankId) {
      navigate({ to: '/farms' })
      return
    }
    const base = { farmId: String(firstFarmId), tankId: String(firstTankId) }
    if (kind === 'monitoring') {
      navigate({ to: '/farms/$farmId/tanks/$tankId/monitoring', params: base })
    } else if (kind === 'nutrients') {
      navigate({ to: '/farms/$farmId/tanks/$tankId/nutrients', params: base })
    } else {
      navigate({ to: '/farms/$farmId/tanks/$tankId/ph-down', params: base })
    }
  }

  const actions: RecordAction[] = [
    {
      label: 'Monitoring',
      description: 'Catat PPM, pH, dan suhu harian',
      icon: Thermometer,
      kind: 'monitoring',
    },
    {
      label: 'AB Mix',
      description: 'Catat penambahan nutrisi',
      icon: FlaskConical,
      kind: 'nutrients',
    },
    {
      label: 'pH Down',
      description: 'Catat penurunan pH',
      icon: Droplets,
      kind: 'ph-down',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="bottom-0 top-auto left-1/2 -translate-x-1/2 translate-y-0 rounded-b-none sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-b-xl">
        <DialogHeader>
          <DialogTitle>Catat Aktivitas</DialogTitle>
          <DialogDescription>Pilih jenis catatan yang ingin Anda input.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.kind}
                type="button"
                onClick={() => goToRecord(action.kind)}
                className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-left transition-colors hover:bg-[#ffce54]/10"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffce54]/20 text-[#1a1c1e]">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{action.label}</span>
                  <span className="block text-xs text-muted-foreground">{action.description}</span>
                </span>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function BottomNav() {
  const [catatOpen, setCatatOpen] = useState(false)

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="flex items-stretch">
          {NAV_ITEMS.slice(0, 2).map((item) => {
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

          <button
            type="button"
            onClick={() => setCatatOpen(true)}
            className="flex flex-1 flex-col items-center justify-center py-2 text-[10px] font-semibold text-slate-500"
            aria-label="Catat aktivitas"
          >
            <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#ffce54] text-[#1a1c1e] shadow-lg shadow-[#ffce54]/40 ring-4 ring-white">
              <Plus className="size-6" />
            </span>
            <span className="mt-0.5">Catat</span>
          </button>

          {NAV_ITEMS.slice(2).map((item) => {
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
      <RecordSheet open={catatOpen} onOpenChange={setCatatOpen} />
    </>
  )
}
