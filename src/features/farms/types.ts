import type { Farm, Tank, User } from '../../lib/types'

export interface FarmMember extends User {
  role: string
  farmUserId?: number
}

export interface FarmDetail extends Farm {
  tanks?: Tank[]
  users?: FarmMember[]
  staff?: User[]
}