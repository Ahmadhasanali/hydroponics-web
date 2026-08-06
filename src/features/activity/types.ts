import type { User } from '../../lib/types'

export interface ActivityLog {
  id: number
  farm_id: number
  description: string
  user?: User
  staff?: { id: number; name: string } | null
  created_at: string
}
