import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  BarChart3,
  Bell,
  Droplets,
  FlaskConical,
  History,
  Landmark,
  LayoutDashboard,
  Plus,
  Settings,
  ShoppingCart,
  Thermometer,
  User,
  Wallet,
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
import { ThemeToggle } from '../theme/ThemeToggle'
import { SettingsSheet } from '../../features/settings/components/SettingsSheet'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/farms', label: 'Farms', icon: Warehouse },
  { to: '/finance', label: 'Keuangan', icon: Wallet },
  { to: '/sales', label: 'Penjualan', icon: ShoppingCart },
  { to: '/accounts', label: 'Akun', icon: Landmark },
  { to: '/reports', label: 'Laporan', icon: BarChart3 },
  { to: '/activity', label: 'Aktivitas', icon: History },
  { to: '/reminders', label: 'Pengingat', icon: Bell },
  { to: '/profile', label: 'Profil', icon: User },
]

const MOBILE_NAV: (NavItem | { kind: 'catat' } | { kind: 'settings' })[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/farms', label: 'Farms', icon: Warehouse },
  { kind: 'catat' },
  { to: '/reminders', label: 'Pengingat', icon: Bell },
  { kind: 'settings' },
]

const rowLinkBase =
  'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors ' +
  'hover:bg-muted hover:text-foreground'

const columnLinkBase =
  'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold ' +
  'text-muted-foreground'

export function Sidebar() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 flex-col gap-1 overflow-y-auto border-r border-border p-3 md:flex">
      <div className="mb-4 flex items-center gap-3 px-2 pt-2">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
          <Droplets className="size-5" />
        </span>
        <span className="text-base font-bold text-foreground">HydroFarm</span>
      </div>
      <p className="px-3 pt-1 pb-2 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
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
            activeProps={{ className: 'bg-secondary/15 text-secondary' }}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
      <div className="mt-auto flex items-center justify-between border-t border-border px-2 pt-3">
        <span className="text-xs font-medium text-muted-foreground">Tema</span>
        <ThemeToggle />
      </div>
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
  const [step, setStep] = useState<'farm' | 'tank' | 'type'>('farm')
  const [farmId, setFarmId] = useState<number | null>(null)
  const [tankId, setTankId] = useState<number | null>(null)
  const { data: tanks } = useTanks(farmId ?? 0)

  useEffect(() => {
    if (step === 'farm' && farms && farms.length === 1 && farmId === null) {
      setFarmId(farms[0].id)
      setStep('tank')
    }
  }, [farms, step, farmId])

  useEffect(() => {
    if (step === 'tank' && farmId !== null && tanks && tanks.length === 1 && tankId === null) {
      setTankId(tanks[0].id)
      setStep('type')
    }
  }, [tanks, step, farmId, tankId])

  const selectedFarm = farms?.find((f) => f.id === farmId) ?? null
  const selectedTank = tanks?.find((t) => t.id === tankId) ?? null

  const close = () => {
    onOpenChange(false)
    setStep('farm')
    setFarmId(null)
    setTankId(null)
  }

  const goToRecord = (kind: RecordKind) => {
    if (!farmId || !tankId) return
    onOpenChange(false)
    const base = { farmId: String(farmId), tankId: String(tankId) }
    if (kind === 'monitoring') navigate({ to: '/farms/$farmId/tanks/$tankId/monitoring', params: base })
    else if (kind === 'nutrients') navigate({ to: '/farms/$farmId/tanks/$tankId/nutrients', params: base })
    else navigate({ to: '/farms/$farmId/tanks/$tankId/ph-down', params: base })
    setStep('farm')
    setFarmId(null)
    setTankId(null)
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
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) close() }}>
      <DialogContent showCloseButton={false} className="bottom-0 top-auto left-1/2 -translate-x-1/2 translate-y-0 rounded-b-none sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-b-xl">
        <DialogHeader>
          <DialogTitle>
            {step === 'farm' ? 'Pilih Farm' : step === 'tank' ? 'Pilih Tank' : 'Catat Aktivitas'}
          </DialogTitle>
          <DialogDescription>
            {step === 'farm' ? 'Pilih farm tujuan catatan.' : step === 'tank' ? 'Pilih tank tujuan catatan.' : 'Pilih jenis catatan yang ingin Anda input.'}
          </DialogDescription>
        </DialogHeader>
        {(selectedFarm || selectedTank) && (
          <div className="flex flex-wrap gap-2">
            {selectedFarm && (
              <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
                Farm: {selectedFarm.name}
              </span>
            )}
            {selectedTank && (
              <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
                Tank: {selectedTank.name}
              </span>
            )}
          </div>
        )}
        <div className="grid gap-2">
          {step === 'farm' && (farms ?? []).map((farm) => (
            <button
              key={farm.id}
              type="button"
              onClick={() => { setFarmId(farm.id); setStep('tank') }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-secondary/10"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                <Warehouse className="size-5" />
              </span>
              <span className="text-sm font-semibold text-foreground">{farm.name}</span>
            </button>
          ))}

          {step === 'tank' && (tanks ?? []).map((tank) => (
            <button
              key={tank.id}
              type="button"
              onClick={() => { setTankId(tank.id); setStep('type') }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-secondary/10"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                <Droplets className="size-5" />
              </span>
              <span className="text-sm font-semibold text-foreground">{tank.name}</span>
            </button>
          ))}

          {step === 'tank' && tanks && tanks.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">Belum ada tank di farm ini.</p>
          )}

          {step === 'type' &&
            actions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.kind}
                  type="button"
                  onClick={() => goToRecord(action.kind)}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-secondary/10"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{action.label}</span>
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
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="flex items-stretch">
          {MOBILE_NAV.map((item) => {
            if ('kind' in item) {
              if (item.kind === 'catat') {
                return (
                  <button
                    key="catat"
                    type="button"
                    onClick={() => setCatatOpen(true)}
                    className="flex flex-1 flex-col items-center justify-center py-2 text-[10px] font-semibold text-muted-foreground"
                    aria-label="Catat aktivitas"
                  >
                    <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg shadow-secondary/40 ring-4 ring-background">
                      <Plus className="size-6" />
                    </span>
                    <span className="mt-0.5">Catat</span>
                  </button>
                )
              }
              return (
                <button
                  key="settings"
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold text-muted-foreground"
                  aria-label="Settings"
                >
                  <Settings className="size-5" />
                  Settings
                </button>
              )
            }
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact ?? false }}
                className={columnLinkBase}
                activeProps={{ className: 'text-secondary' }}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
      <RecordSheet open={catatOpen} onOpenChange={setCatatOpen} />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}
