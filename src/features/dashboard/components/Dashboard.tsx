import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { buttonVariants } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Droplets, Gauge, FlaskConical, Thermometer, Zap } from 'lucide-react'
import { FarmSwitcher } from './FarmSwitcher'
import { TankStatusCard } from './TankStatusCard'
import { ActivityFeed } from './ActivityFeed'
import { FinanceWidget } from '../../finance/components/FinanceWidget'
import { useDashboard, type DashboardStats } from '../hooks/useDashboard'
import { useAutoSelectSingle } from '../../../hooks/useAutoSelectSingle'

function isStatsObject(stats: unknown): stats is DashboardStats {
  return typeof stats === 'object' && stats !== null && !Array.isArray(stats)
}

function StatCard({
  label,
  value,
  icon: Icon,
  tint,
}: {
  label: string
  value: string
  icon: typeof Droplets
  tint: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl ${tint}`}>
          <Icon className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-[0.25em] text-muted-foreground uppercase">
            {label}
          </p>
          <p className="text-3xl font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const [farmId, setFarmId] = useState<number | undefined>(undefined)
  const { data, isLoading, isError } = useDashboard(farmId)
  useAutoSelectSingle(data?.farms, farmId, (farm) => setFarmId(farm.id))

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat dashboard...</p>
  if (isError || !data) return <p className="text-sm text-red-600">Gagal memuat dashboard.</p>

  const stats = data.stats
  const hasStats = isStatsObject(stats)

  if (!data.farms.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <Card>
          <CardContent className="flex flex-col items-start gap-3 py-8">
            <h2 className="text-base font-medium">Belum ada farm</h2>
            <p className="text-sm text-muted-foreground">
              Buat farm pertama Anda untuk mulai memantau tank hidroponik.
            </p>
            <Link to="/farms" className={buttonVariants()}>
              Buat Farm
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          {data.selectedFarm && (
            <p className="mt-1 text-sm text-muted-foreground">
              Farm aktif: <span className="font-medium text-foreground">{data.selectedFarm.name}</span>
            </p>
          )}
        </div>
        <FarmSwitcher
          farms={data.farms}
          selectedFarmId={farmId}
          onSelect={(id) => setFarmId((current) => (current === id ? undefined : id))}
        />
      </div>

      {hasStats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Total Tank"
            value={String(stats.total_tanks)}
            icon={Droplets}
            tint="bg-chart-2/20 text-chart-2"
          />
          <StatCard
            label="Tank Aktif"
            value={String(stats.active_tanks)}
            icon={Zap}
            tint="bg-chart-1/20 text-chart-1"
          />
          <StatCard
            label="Rata-rata PPM"
            value={stats.avg_ppm !== null && stats.avg_ppm !== undefined ? String(stats.avg_ppm) : '–'}
            icon={Gauge}
            tint="bg-chart-3/20 text-chart-3"
          />
          <StatCard
            label="Rata-rata pH"
            value={stats.avg_ph !== null && stats.avg_ph !== undefined ? String(stats.avg_ph) : '–'}
            icon={FlaskConical}
            tint="bg-chart-2/15 text-chart-2"
          />
          <StatCard
            label="Rata-rata Suhu"
            value={stats.avg_temp !== null && stats.avg_temp !== undefined ? `${stats.avg_temp}°C` : '–'}
            icon={Thermometer}
            tint="bg-muted text-muted-foreground"
          />
        </div>
      )}

      <FinanceWidget />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.tanks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada tank pada farm ini.</p>
        ) : (
          data.tanks.map((tank) => <TankStatusCard key={tank.id} tank={tank} />)
        )}
      </div>

      <ActivityFeed logs={data.activityLogs} />
    </div>
  )
}
