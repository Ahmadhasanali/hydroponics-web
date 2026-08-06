export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}

export interface ApiError {
  success: false
  message: string
  errors: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface User {
  id: number
  name: string
  email: string
  is_admin: boolean
  farms?: Farm[]
}

export interface Farm {
  id: number
  name: string
  location?: string
  tanks_count?: number
  created_by: number
}

export interface Tank {
  id: number
  farm_id: number
  name: string
  capacity_liter: number
  notes?: string
  target_ppm_min?: number
  target_ppm_max?: number
  target_ph_min?: number
  target_ph_max?: number
  is_active: boolean
  created_by: number
  current_ppm?: number
  current_ph?: number
  current_water_temperature?: number
  creator?: User
}

export interface AuthResponse {
  user: User
  token: string
}