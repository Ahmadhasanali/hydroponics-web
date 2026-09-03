import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import { useCreatePayment } from '../hooks/useSalesData'
import { formatRupiahInput, parseRupiah, todayISO } from '../../finance/utils/format'

interface PaymentDialogProps {
  open: boolean
  onClose: () => void
  saleId: number
  maxAmount: number
  farmId: number
}

export function PaymentDialog({ open, onClose, saleId, maxAmount, farmId }: PaymentDialogProps) {
  const [accountId, setAccountId] = useState<number | null>(null)
  const [amount, setAmount] = useState(String(maxAmount))
  const [date, setDate] = useState(todayISO())
  const createPayment = useCreatePayment()

  useEffect(() => {
    if (open) setAmount(formatRupiahInput(String(maxAmount)))
  }, [open, maxAmount])

  const { data: accounts = [] } = useAccounts(farmId)

  const canSubmit = accountId !== null && parseRupiah(amount) > 0 && parseRupiah(amount) <= maxAmount

  function submit() {
    if (!canSubmit || accountId === null) return
    createPayment.mutate(
      {
        sale_id: saleId,
        account_id: accountId,
        amount: parseRupiah(amount),
        payment_date: date,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Catat Pembayaran</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Akun tujuan</Label>
            <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={accountId ?? ''} onChange={(e) => setAccountId(Number(e.target.value) || null)}>
              <option value="">Pilih akun…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Jumlah</Label>
            <Input inputMode="numeric" value={amount} onChange={(e) => setAmount(formatRupiahInput(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Tanggal bayar</Label>
            <Input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
          </div>
          <Button className="w-full" disabled={!canSubmit || createPayment.isPending} onClick={submit}>
            {createPayment.isPending ? 'Menyimpan…' : 'Simpan Pembayaran'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
