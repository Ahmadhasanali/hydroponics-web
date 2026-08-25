export type TransactionType = 'income' | 'expense'
export type GroupBy = 'day' | 'week' | 'month'

export interface FinancialCategory {
  id: number
  farm_id: number | null
  name: string
  type: TransactionType
  is_default: boolean
  is_active: boolean
}

export interface FinancialTransaction {
  id: number
  farm_id: number
  category: FinancialCategory
  type: TransactionType
  amount: string
  transaction_date: string
  source: 'manual' | 'telegram'
  status: 'pending_approval' | 'approved'
  note: string | null
  transaction_created_at?: string
}

export interface CategoryBreakdownItem {
  category: string
  type: TransactionType
  total: number
}

export interface SeriesPoint {
  period: string
  income: number
  expense: number
}

export interface FinancialSummary {
  income: number
  expense: number
  net: number
  series: SeriesPoint[]
  categories: CategoryBreakdownItem[]
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface TransactionFilters {
  farm_id: number | ''
  from?: string
  to?: string
  type?: TransactionType | ''
  category_id?: number | ''
  search?: string
  page?: number
}
