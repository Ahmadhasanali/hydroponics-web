import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAccount, createAdjustment, createTransfer, fetchAccounts, fetchAdjustments } from '../api'

const keys = {
  accounts: (farmId: number) => ['accounts', farmId] as const,
}

export function useAccounts(farmId: number | '') {
  return useQuery({
    queryKey: keys.accounts(Number(farmId)),
    queryFn: () => fetchAccounts(Number(farmId)),
    enabled: farmId !== '' && Number.isFinite(farmId),
  })
}

export function useCreateAccount() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['accounts'] })
  return useMutation({ mutationFn: createAccount, onSuccess: invalidate })
}

export function useCreateTransfer() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['accounts'] })
  return useMutation({ mutationFn: createTransfer, onSuccess: invalidate })
}

export function useCreateAdjustment(accountId: number) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['accounts'] })
  return useMutation({ mutationFn: (input: Parameters<typeof createAdjustment>[1]) => createAdjustment(accountId, input), onSuccess: invalidate })
}

export function useAdjustments(accountId: number | null) {
  return useQuery({
    queryKey: ['accounts', 'adjustments', accountId ?? 0] as const,
    queryFn: () => fetchAdjustments(accountId as number),
    enabled: accountId !== null && Number.isFinite(accountId),
  })
}
