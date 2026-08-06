import type { User } from '../../lib/types'

export interface PhDownLog {
  id: number
  tank_id: number
  user_id?: number
  log_date: string
  ph_before: number
  ph_after: number
  ph_down_ml: number
  notes?: string
  user?: User
}

export interface CreatePhDownInput {
  tank_id: number
  log_date: string
  ph_before: number
  ph_after: number
  ph_down_ml: number
  notes?: string
}

export type UpdatePhDownInput = Omit<CreatePhDownInput, 'tank_id'>