import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { FarmPicker } from '../../features/finance/components/FarmPicker'
import { useFarms } from '../../features/farms/hooks/useFarms'
import { useAutoSelectSingle } from '../../hooks/useAutoSelectSingle'
import { useAccounts, useAdjustments } from '../../features/accounts/hooks/useAccounts'
import { AccountFormDialog } from '../../features/accounts/components/AccountFormDialog'
import { TransferDialog } from '../../features/accounts/components/TransferDialog'
import { AdjustDialog } from '../../features/accounts/components/AdjustDialog'
import { formatDate, formatRupiah } from '../../features/finance/utils/format'

export const Route = createFileRoute('/_authenticated/accounts')({
  component: AccountsPage,
})

const typeLabel = { cash: 'Cash', ewallet: 'E-Wallet', bank: 'Bank' } as const

function AccountHistory({ accountId }: { accountId: number }) {
  const { data: adjustments = [] } = useAdjustments(accountId)
  if (adjustments.length === 0) {
    return <p className="pt-2 text-xs text-muted-foreground">Belum ada penyesuaian.</p>
  }
  return (
    <ul className="max-h-32 space-y-1 overflow-auto pt-2">
      {(adjustments as { id: number; amount: string; adjustment_date: string; reason: string }[]).map((a) => (
        <li key={a.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-2 py-1 text-xs">
          <span className="truncate">{a.reason}</span>
          <span className="shrink-0">
            <span className="text-muted-foreground">{formatDate(a.adjustment_date)} · </span>
            <span className={Number(a.amount) >= 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-red-600'}>
              {Number(a.amount) >= 0 ? '+' : ''}{formatRupiah(a.amount)}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

function AccountsPage() {
  const [farmId, setFarmId] = useState<number | ''>('')
  const [openAdd, setOpenAdd] = useState(false)
  const [transfer, setTransfer] = useState<{ open: boolean; fromId?: number }>({ open: false })
  const [adjust, setAdjust] = useState<{ open: boolean; accountId: number } | null>(null)
  const { data: farms } = useFarms()
  useAutoSelectSingle(farms, farmId, (farm) => setFarmId(farm.id))
  const { data: accounts = [] } = useAccounts(farmId)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Akun</h1>
          <p className="text-sm text-muted-foreground">Saldo Cash, e-wallet, dan bank.</p>
        </div>
        <Button disabled={farmId === ''} onClick={() => setOpenAdd(true)}><Plus className="size-4" /> Akun</Button>
      </div>

      <div className="max-w-xs">
        <FarmPicker value={farmId} onChange={setFarmId} />
      </div>

      {farmId === '' ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Pilih farm untuk melihat akun.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm font-semibold">
                  <span>{account.name}</span>
                  <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs text-secondary">{typeLabel[account.type]}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-2xl font-bold">{formatRupiah(account.balance ?? 0)}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setTransfer({ open: true, fromId: account.id })}>Transfer</Button>
                  <Button variant="outline" size="sm" onClick={() => setAdjust({ open: true, accountId: account.id })}>Sesuaikan</Button>
                </div>
                <AccountHistory accountId={account.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {farmId !== '' ? (
        <>
          <AccountFormDialog open={openAdd} onClose={() => setOpenAdd(false)} farmId={Number(farmId)} />
          <TransferDialog open={transfer.open} onClose={() => setTransfer({ open: false })} farmId={Number(farmId)} fromId={transfer.fromId} accounts={accounts} />
          {adjust ? <AdjustDialog open onClose={() => setAdjust(null)} account={accounts.find((a) => a.id === adjust.accountId)} /> : null}
        </>
      ) : null}
    </div>
  )
}
