import { useQuery } from '@tanstack/react-query'
import { fetchAccounts } from '../api'

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
