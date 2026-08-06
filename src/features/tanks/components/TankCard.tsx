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

export function TankCard({ farmId, tank }: { farmId: number; tank: Tank }) {
  const hasTargets = tank.target_ppm_min !== undefined || tank.target_ppm_max !== undefined
  const ppmOk = inRange(tank.current_ppm, tank.target_ppm_min, tank.target_ppm_max)
  const phOk = inRange(tank.current_ph, tank.target_ph_min, tank.target_ph_max)

  const statusClass = !tank.is_active
    ? 'bg-gray-500/20 text-gray-400'
    : hasTargets && (!ppmOk || !phOk)
      ? 'bg-red-500/20 text-red-400'
      : 'bg-green-500/20 text-green-400'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tank.name}</CardTitle>
        <CardDescription>{tank.capacity_liter} L</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          PPM: {tank.current_ppm ?? '–'} · pH: {tank.current_ph ?? '–'}
        </p>
        <span
          className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium uppercase ${statusClass}`}
        >
          {tank.is_active ? (hasTargets && (!ppmOk || !phOk) ? 'Warning' : 'Optimal') : 'Inactive'}
        </span>
      </CardContent>
      <CardFooter>
        <Link
          to="/farms/$farmId/tanks/$tankId"
          params={{ farmId: String(farmId), tankId: String(tank.id) }}
          className="text-sm font-medium text-primary hover:underline"
        >
          Detail
        </Link>
      </CardFooter>
    </Card>
  )
}