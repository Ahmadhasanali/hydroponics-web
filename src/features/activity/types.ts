import type { User } from '../../lib/types'

export interface ActivityLog {
  id: number
  farm_id: number
  description?: string | null
  action?: string
  entity_type?: string
  entity_id?: number
  before_state?: Record<string, unknown> | null
  after_state?: Record<string, unknown> | null
  user?: User
  staff?: { id: number; name: string } | null
  created_at: string
}
