import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { ApiResponse, Farm, Tank } from '../../../lib/types'

export interface DashboardStats {
  total_tanks: number
  active_tanks: number
  avg_ppm: number | null
  avg_ph: number | null
  avg_temp: number | null
}

export interface ActivityLog {
  id: number
  description?: string
  log_type?: string
  created_at?: string
  user?: { id: number; name: string }
}

export interface DashboardData {
  farms: Farm[]
  selectedFarm: Farm | null
  tanks: Tank[]
  stats: DashboardStats | never[]
  activityLogs: ActivityLog[]
}

export function useDashboard(farmId?: number) {
  return useQuery({
    queryKey: ['dashboard', farmId],
    queryFn: async () => {
      const params = farmId !== undefined ? { params: { farm_id: farmId } } : undefined
      const res = await api.get<ApiResponse<DashboardData>>('/dashboard', params)
      return res.data
    },
  })
}