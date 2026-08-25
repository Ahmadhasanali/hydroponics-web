import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { GroupBy, TransactionFilters } from '../types'
import {
  createCategory,
  createTransaction,
  deactivateCategory,
  deleteTransaction,
  fetchCategories,
  fetchSummary,
  fetchTransactions,
  updateTransaction,
  type TransactionInput,
} from '../api'

const keys = {
  categories: (farmId: number) => ['finance', 'categories', farmId] as const,
  transactions: (filters: TransactionFilters) => ['finance', 'transactions', filters] as const,
  summary: (farmId: number, from: string, to: string, groupBy: GroupBy) =>
    ['finance', 'summary', farmId, from, to, groupBy] as const,
}

export function useFinancialCategories(farmId: number | '') {
  return useQuery({
    queryKey: keys.categories(Number(farmId)),
    queryFn: () => fetchCategories(Number(farmId)),
    enabled: farmId !== '' && Number.isFinite(farmId),
  })
}

export function useFinancialTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: keys.transactions(filters),
    queryFn: () => fetchTransactions(filters),
    enabled: filters.farm_id !== '',
  })
}

export function useFinancialSummary(args: {
  farmId: number | ''
  from: string
  to: string
  groupBy?: GroupBy
}) {
  return useQuery({
    queryKey: keys.summary(Number(args.farmId), args.from, args.to, args.groupBy ?? 'day'),
    queryFn: () =>
      fetchSummary({
        farmId: Number(args.farmId),
        from: args.from,
        to: args.to,
        groupBy: args.groupBy,
      }),
    enabled: args.farmId !== '' && Boolean(args.from) && Boolean(args.to),
  })
}

function useInvalidateFinance() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: ['finance'] })
}

export function useCreateTransaction() {
  const invalidate = useInvalidateFinance()
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: invalidate,
  })
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateFinance()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: TransactionInput }) => updateTransaction(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateFinance()
  return useMutation({ mutationFn: deleteTransaction, onSuccess: invalidate })
}

export function useCreateCategory() {
  const invalidate = useInvalidateFinance()
  return useMutation({ mutationFn: createCategory, onSuccess: invalidate })
}

export function useDeactivateCategory() {
  const invalidate = useInvalidateFinance()
  return useMutation({ mutationFn: deactivateCategory, onSuccess: invalidate })
}
