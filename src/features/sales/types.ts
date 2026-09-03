import type { Account } from '../accounts/types'

export type SaleStatus = 'unpaid' | 'partial' | 'paid'

export interface Customer {
  id: number
  farm_id: number
  name: string
  phone: string | null
  address: string | null
  is_active: boolean
}

export interface Product {
  id: number
  farm_id: number
  name: string
  unit: 'kg' | 'pcs'
  default_price: string
  is_active: boolean
}

export interface SaleItem {
  id?: number
  product_id?: number | null
  product_name: string
  unit: 'kg' | 'pcs'
  qty: string
  price: string
  subtotal?: string
}

export interface Payment {
  id: number
  sale_id: number
  account_id: number
  amount: string
  payment_date: string
  note: string | null
  account?: Account
}

export interface Sale {
  id: number
  farm_id: number
  customer_id: number
  customer?: Customer
  sale_date: string
  due_date: string | null
  total_amount: string
  note: string | null
  status: SaleStatus
  paid_amount: number
  remaining_amount: number
  items?: SaleItem[]
  payments?: Payment[]
}

export interface ReceivableItem {
  id: number
  customer: Customer | null
  sale_date: string
  due_date: string | null
  total_amount: number
  paid_amount: number
  remaining_amount: number
  status: SaleStatus
  overdue: boolean
}

export interface ReceivableSummary {
  total_remaining: number
  customer_count: number
  overdue_count: number
}

export interface SaleInput {
  farm_id: number
  customer_id: number
  sale_date: string
  due_date?: string | null
  note?: string
  items: { product_id?: number | null; product_name: string; unit: 'kg' | 'pcs'; qty: number; price: number }[]
  account_id?: number
  amount_paid?: number
}
