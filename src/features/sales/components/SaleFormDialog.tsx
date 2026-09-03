import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { useCreateSale } from '../hooks/useSalesData'
import { useCustomers, useProducts } from '../hooks/useSalesData'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import { todayISO } from '../../finance/utils/format'
import type { Account } from '../../accounts/types'

interface Props {
  open: boolean
  onClose: () => void
  farmId: number
}

type Row = { product_id: number | null; product_name: string; unit: 'kg' | 'pcs'; qty: string; price: string }

const emptyRow = (): Row => ({ product_id: null, product_name: '', unit: 'kg', qty: '', price: '' })

export function SaleFormDialog({ open, onClose, farmId }: Props) {
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [mode, setMode] = useState<'cash' | 'credit'>('cash')
  const [accountId, setAccountId] = useState<number | null>(null)
  const [saleDate, setSaleDate] = useState(todayISO())
  const [dueDate, setDueDate] = useState('')
  const [rows, setRows] = useState<Row[]>([emptyRow()])
  const [note, setNote] = useState('')
  const createSale = useCreateSale()

  const { data: customers = [] } = useCustomers(farmId)
  const { data: products = [] } = useProducts(farmId)
  const { data: accounts = [] } = useAccounts(farmId)

  const defaultCash = useMemo<Account | undefined>(
    () => accounts.find((a) => a.is_default) ?? accounts[0],
    [accounts],
  )

  const totals = useMemo(() => {
    let total = 0
    const filled = rows.filter((r) => r.product_name && r.qty && r.price)
    for (const r of filled) {
      total += Number(r.qty) * Number(r.price)
    }
    return { total, count: filled.length }
  }, [rows])

  const accountSelected = accountId ?? defaultCash?.id ?? null
  const canSubmit =
    customerId !== null &&
    totals.count > 0 &&
    (mode === 'credit' ? dueDate !== '' : accountSelected !== null)

  function updateRow(idx: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  function selectProduct(idx: number, productId: number) {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    updateRow(idx, { product_id: product.id, product_name: product.name, unit: product.unit, price: product.default_price })
  }

  function submit() {
    if (!canSubmit) return
    const items = rows
      .filter((r) => r.product_name && r.qty && r.price)
      .map((r) => ({
        product_id: r.product_id,
        product_name: r.product_name,
        unit: r.unit,
        qty: Number(r.qty),
        price: Number(r.price),
      }))
    createSale.mutate(
      {
        farm_id: farmId,
        customer_id: customerId as number,
        sale_date: saleDate,
        due_date: mode === 'credit' ? dueDate || null : null,
        note: note.trim() === '' ? undefined : note.trim(),
        items,
        account_id: mode === 'cash' ? (accountSelected ?? undefined) : undefined,
        amount_paid: mode === 'cash' ? totals.total : undefined,
      },
      {
        onSuccess: () => {
          setRows([emptyRow()])
          setCustomerId(null)
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
          <DialogTitle>Tambah Penjualan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Pelanggan</Label>
            <select
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={customerId ?? ''}
              onChange={(e) => setCustomerId(Number(e.target.value) || null)}
            >
              <option value="">Pilih warung/toko…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setMode('cash')}
              className={mode === 'cash' ? 'rounded-xl bg-emerald-500/15 px-3 py-2 font-semibold text-emerald-600' : 'rounded-xl px-3 py-2 text-muted-foreground'}>
              Lunas sekarang
            </button>
            <button type="button" onClick={() => setMode('credit')}
              className={mode === 'credit' ? 'rounded-xl bg-amber-500/15 px-3 py-2 font-semibold text-amber-600' : 'rounded-xl px-3 py-2 text-muted-foreground'}>
              Kredit (hutang)
            </button>
          </div>

          <div className="space-y-2">
            <Label>Item</Label>
            {rows.map((row, idx) => (
              <div key={idx} className="space-y-2 rounded-xl border border-border p-2">
                <select
                  className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                  value={row.product_id ?? ''}
                  onChange={(e) => e.target.value && selectProduct(idx, Number(e.target.value))}
                >
                  <option value="">Pilih produk…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.unit}</option>
                  ))}
                </select>
                <div className="grid grid-cols-3 gap-2">
                  <Input inputMode="numeric" placeholder="Qty" value={row.qty}
                    onChange={(e) => updateRow(idx, { qty: e.target.value.replace(/[^0-9.,]/g, '') })} />
                  <Input inputMode="numeric" placeholder="Harga" value={row.price}
                    onChange={(e) => updateRow(idx, { price: e.target.value.replace(/[^0-9]/g, '') })} />
                  <Button type="button" variant="ghost" onClick={() => setRows((prev) => prev.filter((_, i) => i !== idx))}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" className="w-full" onClick={() => setRows((prev) => [...prev, emptyRow()])}>
              <Plus className="size-4" /> Tambah item
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold">{totals.total.toLocaleString('id-ID')}</span>
          </div>

          {mode === 'cash' ? (
            <div className="space-y-1.5">
              <Label>Uang masuk ke akun</Label>
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={accountId ?? defaultCash?.id ?? ''}
                onChange={(e) => setAccountId(Number(e.target.value) || null)}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Jatuh tempo</Label>
              <Input type="date" value={dueDate} min={saleDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label>Tanggal jual</Label>
              <Input type="date" value={saleDate} max={todayISO()} onChange={(e) => setSaleDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Catatan</Label>
              <Input placeholder="Opsional" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>

          <Button className="w-full" disabled={!canSubmit || createSale.isPending} onClick={submit}>
            {createSale.isPending ? 'Menyimpan…' : 'Simpan Penjualan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
