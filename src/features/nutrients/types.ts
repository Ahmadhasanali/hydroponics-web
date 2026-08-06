import type { User } from '../../lib/types'

export interface NutrientAddition {
  id: number
  tank_id: number
  user_id?: number
  log_date: string
  ppm_before: number
  ppm_after: number
  nutrient_a_ml: number
  nutrient_b_ml: number
  notes?: string
  user?: User
}

export interface CreateNutrientInput {
  tank_id: number
  log_date: string
  ppm_before: number
  ppm_after: number
  nutrient_a_ml: number
  nutrient_b_ml: number
  notes?: string
}

export type UpdateNutrientInput = Omit<CreateNutrientInput, 'tank_id'>