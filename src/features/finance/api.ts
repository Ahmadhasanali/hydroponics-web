import { api } from '../../lib/api'
import type {
  FinancialCategory,
  FinancialSummary,
  FinancialTransaction,
  GroupBy,
  PaginationMeta,
  TransactionFilters,
  TransactionType,
} from './types'

interface SuccessEnvelope<T> {
  success: boolean
  data: T
  message?: string
}

interface PaginatedEnvelope<T> {
  success: boolean
  data: T[]
  meta: PaginationMeta
}

export async function fetchCategories(farmId: number): Promise<FinancialCategory[]> {
  const res = await api.get<SuccessEnvelope<{ categories: FinancialCategory[] }>>(
    '/financial-categories',
    { params: { farm_id: farmId } },
  )
  return res.data.categories
}

export async function fetchTransactions(
  params: TransactionFilters,
): Promise<PaginatedEnvelope<FinancialTransaction>> {
  return api.get<PaginatedEnvelope<FinancialTransaction>>('/financial-transactions', {
    params: {
      farm_id: params.farm_id,
      from: params.from || undefined,
      to: params.to || undefined,
      type: params.type || undefined,
      category_id: params.category_id || undefined,
      search: params.search || undefined,
      page: params.page || 1,
    },
  })
}

export async function fetchSummary(args: {
  farmId: number
  from?: string
  to?: string
  groupBy?: GroupBy
}): Promise<FinancialSummary> {
  const res = await api.get<SuccessEnvelope<{ summary: FinancialSummary }>>(
    '/financial-transactions/summary',
    {
      params: {
        farm_id: args.farmId,
        from: args.from || undefined,
        to: args.to || undefined,
        group_by: args.groupBy || undefined,
      },
    },
  )
  return res.data.summary
}

export interface TransactionInput {
  farm_id: number
  category_id: number
  type: TransactionType
  amount: number
  transaction_date: string
  note?: string
}

export async function createTransaction(input: TransactionInput): Promise<void> {
  await api.post('/financial-transactions', input)
}

export async function updateTransaction(id: number, input: TransactionInput): Promise<void> {
  await api.put(`/financial-transactions/${id}`, input)
}

export async function deleteTransaction(id: number): Promise<void> {
  await api.delete(`/financial-transactions/${id}`)
}

export async function createCategory(input: {
  farm_id: number
  name: string
  type: TransactionType
}): Promise<FinancialCategory> {
  const res = await api.post<SuccessEnvelope<{ category: FinancialCategory }>>('/financial-categories', input)
  return res.data.category
}

export async function deactivateCategory(id: number): Promise<void> {
  await api.delete(`/financial-categories/${id}`)
}
