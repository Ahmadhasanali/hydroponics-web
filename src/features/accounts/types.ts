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

export interface AccountTransferInput {
  farm_id: number
  from_account_id: number
  to_account_id: number
  amount: number
  transfer_date: string
  note?: string
}

export interface BalanceAdjustmentInput {
  amount: number
  adjustment_date: string
  reason: string
}
