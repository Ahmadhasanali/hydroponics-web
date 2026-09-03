import { api } from '../../lib/api'
import type { Account, AccountTransferInput, BalanceAdjustmentInput } from './types'

interface Ok<T> { success: boolean; data: T; message?: string }

export async function fetchAccounts(farmId: number): Promise<Account[]> {
  const res = await api.get<Ok<{ accounts: Account[] }>>('/accounts', { params: { farm_id: farmId } })
  return res.data.accounts
}

export async function createAccount(input: { farm_id: number; name: string; type: Account['type']; balance_initial?: number }): Promise<Account> {
  const res = await api.post<Ok<{ account: Account }>>('/accounts', input)
  return res.data.account
}

export async function createTransfer(input: AccountTransferInput): Promise<void> {
  await api.post('/account-transfers', input)
}

export async function createAdjustment(accountId: number, input: BalanceAdjustmentInput): Promise<void> {
  await api.post(`/accounts/${accountId}/adjustments`, input)
}

export async function fetchAdjustments(accountId: number): Promise<unknown[]> {
  const res = await api.get<Ok<{ adjustments: unknown[] }>>(`/accounts/${accountId}/adjustments`)
  return res.data.adjustments
}
