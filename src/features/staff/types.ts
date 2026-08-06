export interface Staff {
  id: number
  farm_id: number
  name: string
  username: string
  is_active: boolean
  created_at: string
}

export interface CreateStaffInput {
  name: string
  username: string
  password: string
}
