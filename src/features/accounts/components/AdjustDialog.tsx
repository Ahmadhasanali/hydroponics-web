import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { useCreateAdjustment } from '../hooks/useAccounts'
import { todayISO } from '../../finance/utils/format'
import type { Account } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  account: Account | undefined
}

export function AdjustDialog({ open, onClose, account }: Props) {
  const [direction, setDirection] = useState<'in' | 'out'>('in')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [date, setDate] = useState(todayISO())
  const createAdjustment = useCreateAdjustment(account?.id ?? 0)

  const canSubmit = account !== undefined && Number(amount) > 0 && reason.trim() !== ''

  function submit() {
    if (!canSubmit || !account) return
    const value = direction === 'in' ? Number(amount) : -Number(amount)
    createAdjustment.mutate(
      { amount: value, adjustment_date: date, reason: reason.trim() },
      {
        onSuccess: () => {
          setAmount('')
          setReason('')
          onClose()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Sesuaikan Saldo — {account?.name ?? ''}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setDirection('in')}
              className={direction === 'in' ? 'rounded-xl bg-emerald-500/15 px-3 py-2 font-semibold text-emerald-600' : 'rounded-xl px-3 py-2 text-muted-foreground'}>
              Tambah saldo
            </button>
            <button type="button" onClick={() => setDirection('out')}
              className={direction === 'out' ? 'rounded-xl bg-red-500/15 px-3 py-2 font-semibold text-red-600' : 'rounded-xl px-3 py-2 text-muted-foreground'}>
              Kurangi saldo
            </button>
          </div>
          <div className="space-y-1.5">
            <Label>Nominal</Label>
            <Input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} />
          </div>
          <div className="space-y-1.5">
            <Label>Alasan (wajib)</Label>
            <Input placeholder="mis. Topup dari ATM" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tanggal</Label>
            <Input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
          </div>
          <Button className="w-full" disabled={!canSubmit || createAdjustment.isPending} onClick={submit}>
            {createAdjustment.isPending ? 'Menyimpan…' : 'Simpan Penyesuaian'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
