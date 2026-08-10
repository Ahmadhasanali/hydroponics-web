import { createFileRoute, Link } from '@tanstack/react-router'
import { useTank } from '../../../../../../features/tanks/hooks/useTanks'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../../../../components/ui/card'

export const Route = createFileRoute('/_authenticated/farms/$farmId/tanks/$tankId/')({
  component: TankDetailPage,
})

export function TankDetailPage() {
  const { farmId, tankId } = Route.useParams()
  const tankNum = Number(tankId)
  const { data: tank, isLoading, isError } = useTank(tankNum)

  if (!tankId || Number.isNaN(tankNum)) {
    return <p className="text-sm text-red-600">ID tank tidak valid.</p>
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat tank...</p>
  if (isError) return <p className="text-sm text-red-600">Gagal memuat detail tank.</p>
  if (!tank) return null

  const targetPpm = tank.target_ppm_min !== undefined || tank.target_ppm_max !== undefined
    ? `${tank.target_ppm_min ?? '–'} – ${tank.target_ppm_max ?? '–'}`
    : '–'
  const targetPh = tank.target_ph_min !== undefined || tank.target_ph_max !== undefined
    ? `${tank.target_ph_min ?? '–'} – ${tank.target_ph_max ?? '–'}`
    : '–'

  return (
    <div className="space-y-6">
      <Link
        to="/farms/$farmId/tanks"
        params={{ farmId }}
        className="text-sm text-secondary hover:text-foreground hover:underline"
      >
        &larr; Kembali ke daftar tank
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-foreground">{tank.name}</h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold tracking-[0.24em] uppercase ${
              tank.is_active ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
            }`}
          >
            {tank.is_active ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
        {tank.notes && <p className="text-sm text-muted-foreground">{tank.notes}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metrik Saat Ini</CardTitle>
          <CardDescription>Nilai sensor terakhir yang dilaporkan</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Metric label="Kapasitas" value={`${tank.capacity_liter} L`} />
            <Metric label="PPM" value={tank.current_ppm != null ? String(tank.current_ppm) : '–'} />
            <Metric label="pH" value={tank.current_ph != null ? String(tank.current_ph) : '–'} />
            <Metric
              label="Suhu (°C)"
              value={tank.current_water_temperature != null ? String(tank.current_water_temperature) : '–'}
            />
            <Metric label="Target PPM" value={targetPpm} />
            <Metric label="Target pH" value={targetPh} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monitoring</CardTitle>
          <CardDescription>Riwayat dan tren tank ini</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            to="/farms/$farmId/tanks/$tankId/monitoring"
            params={{ farmId, tankId }}
            className="text-sm font-medium text-secondary hover:text-foreground hover:underline"
          >
            Lihat monitoring →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nutrisi</CardTitle>
          <CardDescription>Riwayat penambahan nutrisi tank ini</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            to="/farms/$farmId/tanks/$tankId/nutrients"
            params={{ farmId, tankId }}
            className="text-sm font-medium text-secondary hover:text-foreground hover:underline"
          >
            Lihat nutrisi →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>pH Down</CardTitle>
          <CardDescription>Riwayat penyesuaian pH tank ini</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            to="/farms/$farmId/tanks/$tankId/ph-down"
            params={{ farmId, tankId }}
            className="text-sm font-medium text-secondary hover:text-foreground hover:underline"
          >
            Lihat pH down →
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-lg font-medium">{value}</dd>
    </div>
  )
}