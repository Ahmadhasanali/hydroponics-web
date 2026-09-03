import { api } from '../../lib/api'
import type { Account } from './types'

interface Ok<T> { success: boolean; data: T; message?: string }

export async function fetchAccounts(farmId: number): Promise<Account[]> {
  const res = await api.get<Ok<{ accounts: Account[] }>>('/accounts', { params: { farm_id: farmId } })
  return res.data.accounts
}
