import type { ActivityLog } from '../types'

export interface ActivityTarget {
  to: string
  params: Record<string, string>
}

export function activityLogTarget(log: ActivityLog): ActivityTarget | null {
  const entityType = log.entity_type ?? ''
  const entityId = log.entity_id
  if (!entityType || !entityId) return null

  const farmId = String(log.farm_id)
  const tankId = String(entityId)

  switch (entityType) {
    case 'farm':
      return { to: '/farms/$farmId', params: { farmId } }
    case 'tank':
      return { to: '/farms/$farmId/tanks/$tankId', params: { farmId, tankId } }
    case 'daily_monitoring':
    case 'nutrient_addition':
    case 'ph_down_log': {
      // tank_id is in before_state/after_state snapshot
      const state = log.before_state ?? log.after_state
      const stateTankId = state?.tank_id
      if (!stateTankId) return null
      const sub = entityType === 'daily_monitoring' ? 'monitoring' : entityType === 'nutrient_addition' ? 'nutrients' : 'ph-down'
      return {
        to: '/farms/$farmId/tanks/$tankId/$sub' as const,
        params: { farmId, tankId: String(stateTankId), sub },
      }
    }
    default:
      return null
  }
}
