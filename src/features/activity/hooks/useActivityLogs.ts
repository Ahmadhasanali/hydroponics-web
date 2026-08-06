import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { PaginatedResponse } from '../../../lib/types'
import type { ActivityLog } from '../types'

export function useActivityLogs(farmId: number, page = 1) {
  return useQuery({
    queryKey: ['activity-logs', farmId, page],
    queryFn: () =>
      api.get<PaginatedResponse<ActivityLog>>('/activity-logs', {
        params: { farm_id: farmId, page },
      }),
    enabled: !!farmId,
  })
}
