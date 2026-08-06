import type { User } from '../../lib/types'

export interface DailyMonitoring {
  id: number
  tank_id: number
  user_id?: number
  log_date: string
  ppm: number
  ph: number
  water_temperature?: number
  notes?: string
  user?: User
}

export interface CreateMonitoringInput {
  tank_id: number
  log_date: string
  ppm: number
  ph: number
  water_temperature?: number
  notes?: string
}

export type UpdateMonitoringInput = Omit<CreateMonitoringInput, 'tank_id'>