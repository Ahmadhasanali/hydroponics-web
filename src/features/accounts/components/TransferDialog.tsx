import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { useCreateTransfer } from '../hooks/useAccounts'
import { todayISO } from '../../finance/utils/format'
import type { Account } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  farmId: number
  fromId?: number
  accounts: Account[]
}

export function TransferDialog({ open, onClose, farmId, fromId, accounts }: Props) {
  const [from, setFrom] = useState<number | null>(fromId ?? null)
  const [to, setTo] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const createTransfer = useCreateTransfer()

  const canSubmit = from !== null && to !== null && from !== to && Number(amount) > 0

  function submit() {
    if (!canSubmit || from === null || to === null) return
    createTransfer.mutate(
      {
        farm_id: farmId,
        from_account_id: from,
        to_account_id: to,
        amount: Number(amount),
        transfer_date: date,
        note: note.trim() === '' ? undefined : note.trim(),
      },
      {
        onSuccess: () => {
          setAmount('')
          setNote('')
          onClose()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Transfer Antar Akun</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Dari akun</Label>
            <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={from ?? ''} onChange={(e) => setFrom(Number(e.target.value) || null)}>
              <option value="">Pilih akun asal…</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Ke akun</Label>
            <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={to ?? ''} onChange={(e) => setTo(Number(e.target.value) || null)}>
              <option value="">Pilih akun tujuan…</option>
              {accounts.filter((a) => a.id !== from).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Nominal</Label>
            <Input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label>Tanggal</Label>
              <Input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Catatan</Label>
              <Input placeholder="Opsional" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <Button className="w-full" disabled={!canSubmit || createTransfer.isPending} onClick={submit}>
            {createTransfer.isPending ? 'Menyimpan…' : 'Simpan Transfer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
