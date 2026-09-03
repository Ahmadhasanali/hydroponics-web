export type AccountType = 'cash' | 'ewallet' | 'bank'

export interface Account {
  id: number
  farm_id: number
  name: string
  type: AccountType
  balance_initial: string
  is_default: boolean
  is_active: boolean
  balance?: number
}
