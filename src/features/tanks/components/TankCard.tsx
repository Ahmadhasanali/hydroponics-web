import { Link } from '@tanstack/react-router'
import type { Tank } from '../../../lib/types'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from '../../../components/ui/card'

function inRange(value: number | undefined, min?: number, max?: number): boolean {
  if (value === undefined) return false
  if (min !== undefined && value < min) return false
  if (max !== undefined && value > max) return false
  return min !== undefined || max !== undefined
}

function statusBadge(tank: Tank): string {
  if (!tank.is_active) return 'bg-muted text-muted-foreground'
  const hasTargets = tank.target_ppm_min !== undefined || tank.target_ppm_max !== undefined
  const ppmOk = inRange(tank.current_ppm, tank.target_ppm_min, tank.target_ppm_max)
  const phOk = inRange(tank.current_ph, tank.target_ph_min, tank.target_ph_max)
  if (hasTargets && (!ppmOk || !phOk)) return 'bg-warning/20 text-warning'
  return 'bg-success/20 text-success'
}

function statusLabel(tank: Tank): string {
  if (!tank.is_active) return 'Nonaktif'
  const hasTargets = tank.target_ppm_min !== undefined || tank.target_ppm_max !== undefined
  const ppmOk = inRange(tank.current_ppm, tank.target_ppm_min, tank.target_ppm_max)
  const phOk = inRange(tank.current_ph, tank.target_ph_min, tank.target_ph_max)
  return hasTargets && (!ppmOk || !phOk) ? 'Perhatian' : 'Optimal'
}

export function TankCard({ farmId, tank }: { farmId: number; tank: Tank }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-semibold text-foreground">
          <span className={`h-2.5 w-2.5 rounded-full ${tank.is_active ? 'bg-success' : 'bg-muted-foreground/40'}`} />
          {tank.name}
        </CardTitle>
        <CardDescription>{tank.capacity_liter} L</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
          PPM: <span className="font-medium text-foreground">{tank.current_ppm ?? '–'}</span> · pH:{' '}
          <span className="font-medium text-foreground">{tank.current_ph ?? '–'}</span>
        </div>
        <span
          className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-[0.24em] uppercase ${statusBadge(tank)}`}
        >
          {statusLabel(tank)}
        </span>
      </CardContent>
      <CardFooter>
        <Link
          to="/farms/$farmId/tanks/$tankId"
          params={{ farmId: String(farmId), tankId: String(tank.id) }}
          className="text-sm font-medium text-secondary hover:text-foreground"
        >
          Detail
        </Link>
      </CardFooter>
    </Card>
  )
}
