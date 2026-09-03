import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { useCreateCategory, useCreateTransaction } from '../hooks/useFinancialData'
import { formatRupiahInput, parseRupiah, todayISO } from '../utils/format'
import type { Account } from '../../accounts/types'
import type { FinancialCategory, TransactionType } from '../types'

interface TransactionFormDialogProps {
  open: boolean
  onClose: () => void
  farmId: number
  categories: FinancialCategory[]
  accounts?: Account[]
}

export function TransactionFormDialog({ open, onClose, farmId, categories, accounts = [] }: TransactionFormDialogProps) {
  const [type, setType] = useState<TransactionType>('expense')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [categoryQuery, setCategoryQuery] = useState('')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [accountId, setAccountId] = useState<number | null>(null)
  const create = useCreateTransaction()
  const createCategory = useCreateCategory()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const defaultCash = useMemo<Account | undefined>(
    () => accounts.find((a) => a.type === 'cash' && a.is_default) ?? accounts.find((a) => a.is_default) ?? accounts[0],
    [accounts],
  )

  useEffect(() => {
    if (open) {
      setAccountId(defaultCash?.id ?? null)
      setAmount('')
    }
  }, [open, defaultCash])

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.type === type && c.is_active),
    [categories, type],
  )

  const filteredCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase()
    if (q === '') return visibleCategories
    return visibleCategories.filter((c) => c.name.toLowerCase().includes(q))
  }, [visibleCategories, categoryQuery])

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId],
  )

  const hasExactMatch = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase()
    if (q === '') return false
    return visibleCategories.some((c) => c.name.toLowerCase() === q)
  }, [visibleCategories, categoryQuery])

  const showCreateOption = categoryQuery.trim() !== '' && !hasExactMatch

  const canSubmit = categoryId !== null && amount !== '' && parseRupiah(amount) > 0 && farmId !== 0

  useEffect(() => {
    if (!open) {
      setCategoryOpen(false)
    }
  }, [open])

  useEffect(() => {
    function handlePointerDownOutside(e: PointerEvent | MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoryOpen(false)
      }
    }
    if (categoryOpen) {
      document.addEventListener('pointerdown', handlePointerDownOutside, true)
      document.addEventListener('mousedown', handlePointerDownOutside, true)
      return () => {
        document.removeEventListener('pointerdown', handlePointerDownOutside, true)
        document.removeEventListener('mousedown', handlePointerDownOutside, true)
      }
    }
  }, [categoryOpen])

  function handleTypeChange(next: TransactionType) {
    setType(next)
    setCategoryId(null)
    setCategoryQuery('')
    setCategoryOpen(false)
  }

  function handleSelectCategory(cat: FinancialCategory) {
    setCategoryId(cat.id)
    setCategoryQuery(cat.name)
    setCategoryOpen(false)
  }

  async function handleCreateCategory() {
    const name = categoryQuery.trim()
    if (name === '' || farmId === 0) return
    try {
      const created = await createCategory.mutateAsync({ farm_id: farmId, name, type })
      setCategoryId(created.id)
      setCategoryQuery(created.name)
      setCategoryOpen(false)
    } catch {
    }
  }

  function submit(): void {
    if (!canSubmit || categoryId === null) return
    create.mutate(
      {
        farm_id: farmId,
        category_id: categoryId,
        type,
        amount: parseRupiah(amount),
        transaction_date: date,
        note: note.trim() === '' ? undefined : note.trim(),
        account_id: accountId ?? undefined,
      },
      {
        onSuccess: () => {
          setAmount('')
          setNote('')
          setCategoryId(null)
          setCategoryQuery('')
          setAccountId(null)
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
            onClick={() => handleTypeChange('expense')}
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
            onClick={() => handleTypeChange('income')}
            className={
              type === 'income'
                ? 'rounded-xl px-3 py-2 font-semibold bg-emerald-500/15 text-emerald-600'
                : 'rounded-xl px-3 py-2 text-muted-foreground'
            }
          >
            Pemasukan
          </button>
        </div>

        <div ref={dropdownRef} className="relative">
          <Input
            placeholder="Kategori"
            value={categoryOpen ? categoryQuery : selectedCategory ? selectedCategory.name : categoryQuery}
            onFocus={() => setCategoryOpen(true)}
            onChange={(e) => {
              setCategoryQuery(e.target.value)
              setCategoryOpen(true)
              if (selectedCategory && e.target.value !== selectedCategory.name) {
                const stillMatches = visibleCategories.some(
                  (c) => c.id === selectedCategory.id && c.name.toLowerCase() === e.target.value.trim().toLowerCase(),
                )
                if (!stillMatches && e.target.value.trim() !== selectedCategory.name) {
                  setCategoryId(null)
                }
              }
            }}
          />

          {categoryOpen && (
            <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border bg-popover shadow-lg">
              {filteredCategories.length === 0 && !showCreateOption ? (
                <div className="px-3 py-3 text-sm text-muted-foreground">Tidak ada kategori</div>
              ) : (
                filteredCategories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCategory(c)}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-muted ${
                      categoryId === c.id ? 'bg-muted font-semibold text-foreground' : 'text-foreground'
                    }`}
                  >
                    <span>{c.name}</span>
                    {c.is_default && (
                      <span className="ml-2 rounded-full bg-secondary/20 px-2 py-0.5 text-[10px] font-medium text-secondary">bawaan</span>
                    )}
                  </button>
                ))
              )}
              {showCreateOption && (
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={createCategory.isPending}
                  className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-left text-sm font-medium text-primary hover:bg-muted disabled:opacity-50"
                >
                  <Plus className="size-4 shrink-0" />
                  {createCategory.isPending ? 'Membuat...' : `Buat kategori "${categoryQuery.trim()}"`}
                </button>
              )}
            </div>
          )}
          {selectedCategory && !categoryOpen && (
            <p className="mt-1 text-xs text-muted-foreground">
              Terpilih: <span className="font-medium text-foreground">{selectedCategory.name}</span>
            </p>
          )}
        </div>

        {accounts.length > 0 && (
          <div className="space-y-1.5">
            <Label>Akun</Label>
            <select
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={accountId ?? ''}
              onChange={(e) => setAccountId(e.target.value === '' ? null : Number(e.target.value))}
            >
              <option value="">Cash (default)</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Kosongkan untuk memakai akun Cash default.</p>
          </div>
        )}

        <Input
          inputMode="numeric"
          placeholder="Jumlah (Rp)"
          value={amount}
          onChange={(e) => setAmount(formatRupiahInput(e.target.value))}
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
