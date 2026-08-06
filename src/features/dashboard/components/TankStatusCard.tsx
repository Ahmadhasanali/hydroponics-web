import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import type { Tank } from '../../../lib/types'

function inRange(value: number | undefined, min?: number, max?: number): boolean {
  if (value === undefined) return false
  if (min !== undefined && value < min) return false
  if (max !== undefined && value > max) return false
  return min !== undefined || max !== undefined
}

export function TankStatusCard({ tank }: { tank: Tank }) {
  const hasTargets =
    tank.target_ppm_min !== undefined ||
    tank.target_ppm_max !== undefined ||
    tank.target_ph_min !== undefined ||
    tank.target_ph_max !== undefined
  const ppmOk = inRange(tank.current_ppm, tank.target_ppm_min, tank.target_ppm_max)
  const phOk = inRange(
    tank.current_ph,
    tank.target_ph_min,
    tank.target_ph_max,
  )
  const temp = tank.current_water_temperature

  const statusClass = !tank.is_active
    ? 'bg-gray-500/20 text-gray-400'
    : hasTargets && (!ppmOk || !phOk)
      ? 'bg-red-500/20 text-red-400'
      : 'bg-green-500/20 text-green-400'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{tank.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{tank.capacity_liter} L capacity</p>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">PPM</dt>
            <dd>{tank.current_ppm ?? '–'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">pH</dt>
            <dd>{tank.current_ph ?? '–'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Temp</dt>
            <dd>{temp !== undefined ? `${temp}°C` : '–'}</dd>
          </div>
        </dl>
        <span
          className={`mt-3 inline-block rounded-full px-2 py-0.5 text-xs font-medium uppercase ${statusClass}`}
        >
          {tank.is_active ? (hasTargets && (!ppmOk || !phOk) ? 'Warning' : 'Optimal') : 'Inactive'}
        </span>
      </CardContent>
    </Card>
  )
}