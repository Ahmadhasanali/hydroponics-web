import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import type { Tank } from '../../../lib/types'

function inRange(value: number | undefined, min?: number, max?: number): boolean {
  if (value === undefined) return false
  if (min !== undefined && value < min) return false
  if (max !== undefined && value > max) return false
  return min !== undefined || max !== undefined
}

function statusBadge(tank: Tank): string {
  if (!tank.is_active) return 'bg-muted text-muted-foreground'
  const hasTargets =
    tank.target_ppm_min !== undefined ||
    tank.target_ppm_max !== undefined ||
    tank.target_ph_min !== undefined ||
    tank.target_ph_max !== undefined
  const ppmOk = inRange(tank.current_ppm, tank.target_ppm_min, tank.target_ppm_max)
  const phOk = inRange(tank.current_ph, tank.target_ph_min, tank.target_ph_max)
  if (hasTargets && (!ppmOk || !phOk)) return 'bg-warning/20 text-warning'
  return 'bg-success/20 text-success'
}

function statusLabel(tank: Tank): string {
  if (!tank.is_active) return 'Nonaktif'
  const hasTargets =
    tank.target_ppm_min !== undefined ||
    tank.target_ppm_max !== undefined ||
    tank.target_ph_min !== undefined ||
    tank.target_ph_max !== undefined
  const ppmOk = inRange(tank.current_ppm, tank.target_ppm_min, tank.target_ppm_max)
  const phOk = inRange(tank.current_ph, tank.target_ph_min, tank.target_ph_max)
  return hasTargets && (!ppmOk || !phOk) ? 'Perhatian' : 'Optimal'
}

export function TankStatusCard({ tank }: { tank: Tank }) {
  const temp = tank.current_water_temperature

  return (
    <Link
      to="/farms/$farmId/tanks/$tankId"
      params={{ farmId: String(tank.farm_id), tankId: String(tank.id) }}
      className="block rounded-3xl transition-shadow hover:shadow-md"
    >
      <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-semibold text-foreground">
          <span className={`h-2.5 w-2.5 rounded-full ${tank.is_active ? 'bg-success' : 'bg-muted-foreground/40'}`} />
          {tank.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl bg-muted p-3">
          <p className="text-xs text-muted-foreground">Kapasitas {tank.capacity_liter} L</p>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">PPM</dt>
              <dd className="font-medium">{tank.current_ppm ?? '–'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">pH</dt>
              <dd className="font-medium">{tank.current_ph ?? '–'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Suhu</dt>
              <dd className="font-medium">{temp != null ? `${temp}°C` : '–'}</dd>
            </div>
          </dl>
        </div>
        <span
          className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-[0.24em] uppercase ${statusBadge(tank)}`}
        >
          {statusLabel(tank)}
        </span>
      </CardContent>
    </Card>
    </Link>
  )
}
