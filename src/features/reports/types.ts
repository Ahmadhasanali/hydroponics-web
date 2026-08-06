export interface MonitoringAggregates {
  count: number
  avg_ppm: number
  highest_ppm: number
  lowest_ppm: number
  avg_ph: number
  highest_ph: number
  lowest_ph: number
}

export interface NutrientAggregates {
  count: number
  total_nutrient_a_ml: number
  total_nutrient_b_ml: number
}

export interface PhDownAggregates {
  count: number
  total_ph_down_ml: number
}

export interface ReportParams {
  farm_id: string
  tank_id: string
  start_date: string
  end_date: string
}

export type ReportType = 'monitoring' | 'nutrient' | 'ph-down'