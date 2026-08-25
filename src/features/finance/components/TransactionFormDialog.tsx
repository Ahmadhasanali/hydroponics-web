import { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { useCreateTransaction } from '../hooks/useFinancialData'
import type { FinancialCategory, TransactionType } from '../types'

interface TransactionFormDialogProps {
  open: boolean
  onClose: () => void
  farmId: number
  categories: FinancialCategory[]
}

function todayISO(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function TransactionFormDialog({ open, onClose, farmId, categories }: TransactionFormDialogProps) {
  const [type, setType] = useState<TransactionType>('expense')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const create = useCreateTransaction()

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.type === type && c.is_active),
    [categories, type],
  )

  const canSubmit = categoryId !== null && amount !== '' && Number(amount) > 0 && farmId !== 0

  function submit(): void {
    if (!canSubmit || categoryId === null) return
    create.mutate(
      {
        farm_id: farmId,
        category_id: categoryId,
        type,
        amount: Number(amount),
        transaction_date: date,
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
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={
              type === 'expense'
                ? 'rounded-xl px-3 py-2 font-semibold bg-red-500/15 text-red-600'
                : 'rounded-xl px-3 py-2 text-muted-foreground'
            }
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={
              type === 'income'
                ? 'rounded-xl px-3 py-2 font-semibold bg-emerald-500/15 text-emerald-600'
                : 'rounded-xl px-3 py-2 text-muted-foreground'
            }
          >
            Pemasukan
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {visibleCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(c.id)}
              className={
                categoryId === c.id
                  ? 'rounded-full px-3 py-1.5 text-sm font-semibold bg-primary text-primary-foreground'
                  : 'rounded-full px-3 py-1.5 text-sm border border-border text-muted-foreground'
              }
            >
              {c.name}
            </button>
          ))}
        </div>

        <Input
          inputMode="numeric"
          placeholder="Jumlah (Rp)"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
        />
        <Input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
        <Input placeholder="Catatan (opsional)" value={note} onChange={(e) => setNote(e.target.value)} />

        <Button disabled={!canSubmit || create.isPending} onClick={submit}>
          {create.isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
