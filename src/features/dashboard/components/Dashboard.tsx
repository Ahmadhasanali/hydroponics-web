import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { buttonVariants } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { FarmSwitcher } from './FarmSwitcher'
import { TankStatusCard } from './TankStatusCard'
import { ActivityFeed } from './ActivityFeed'
import { useDashboard, type DashboardStats } from '../hooks/useDashboard'

function isStatsObject(stats: unknown): stats is DashboardStats {
  return typeof stats === 'object' && stats !== null && !Array.isArray(stats)
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-medium">{value}</p>
    </div>
  )
}

export function Dashboard() {
  const [farmId, setFarmId] = useState<number | undefined>(undefined)
  const { data, isLoading, isError } = useDashboard(farmId)

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat dashboard...</p>
  if (isError || !data) return <p className="text-sm text-red-500">Gagal memuat dashboard.</p>

  const stats = data.stats
  const hasStats = isStatsObject(stats)

  if (!data.farms.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-medium">Dashboard</h1>
        <Card>
          <CardContent className="flex flex-col items-start gap-3 py-8">
            <h2 className="text-base font-medium">Belum ada farm</h2>
            <p className="text-sm text-muted-foreground">
              Buat farm pertama Anda untuk mulai memantau tank hidroponik.
            </p>
            <Link to="/farms" className={buttonVariants()}>
              Create Farm
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-medium">Dashboard</h1>
        <FarmSwitcher
          farms={data.farms}
          selectedFarmId={farmId}
          onSelect={(id) => setFarmId((current) => (current === id ? undefined : id))}
        />
      </div>

      {hasStats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatItem label="Total Tanks" value={String(stats.total_tanks)} />
          <StatItem label="Active Tanks" value={String(stats.active_tanks)} />
          <StatItem label="Avg PPM" value={stats.avg_ppm !== null && stats.avg_ppm !== undefined ? String(stats.avg_ppm) : '–'} />
          <StatItem label="Avg pH" value={stats.avg_ph !== null && stats.avg_ph !== undefined ? String(stats.avg_ph) : '–'} />
          <StatItem label="Avg Temp" value={stats.avg_temp !== null && stats.avg_temp !== undefined ? `${stats.avg_temp}°C` : '–'} />
        </div>
      )}

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