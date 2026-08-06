import type { Tank } from '../../lib/types'

export interface CreateTankInput {
  farm_id: number
  name: string
  capacity_liter: number
  notes?: string
  target_ppm_min?: number
  target_ppm_max?: number
  target_ph_min?: number
  target_ph_max?: number
  is_active?: boolean
}

export type UpdateTankInput = Omit<CreateTankInput, 'farm_id'>

export interface TankDetail extends Tank {
  monitorings?: unknown[]
  nutrientAdditions?: unknown[]
  phDownLogs?: unknown[]
}