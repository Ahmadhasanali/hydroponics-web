import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { useCreateCategory, useDeactivateCategory } from '../hooks/useFinancialData'
import type { FinancialCategory, TransactionType } from '../types'

interface CategoryManagerModalProps {
  open: boolean
  onClose: () => void
  farmId: number
  categories: FinancialCategory[]
}

export function CategoryManagerModal({ open, onClose, farmId, categories }: CategoryManagerModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const create = useCreateCategory()
  const deact = useDeactivateCategory()

  const canCreate = name.trim().length > 0 && farmId !== 0

  function submit(): void {
    if (!canCreate) return
    create.mutate(
      { farm_id: farmId, name: name.trim(), type },
      {
        onSuccess: () => setName(''),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kelola Kategori</DialogTitle>
          <DialogDescription>Tambah kategori custom atau nonaktifkan yang tidak dipakai.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {categories.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Belum ada kategori.</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {c.name}
                      <span
                        className={
                          c.type === 'income'
                            ? 'ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-600'
                            : 'ml-2 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-600'
                        }
                      >
                        {c.type === 'income' ? 'Masuk' : 'Keluar'}
                      </span>
                      {c.is_default ? (
                        <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                          bawaan
                        </span>
                      ) : null}
                      {!c.is_active ? (
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          nonaktif
                        </span>
                      ) : null}
                    </p>
                  </div>
                  {!c.is_default && c.is_active ? (
                    <Button
                      variant="ghost"
                      size="xs"
                      disabled={deact.isPending}
                      onClick={() => deact.mutate(c.id)}
                    >
                      Nonaktifkan
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border p-3 space-y-3">
          <p className="text-sm font-semibold text-foreground">Tambah kategori</p>
          <Input placeholder="Nama kategori" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={
                type === 'expense'
                  ? 'rounded-xl px-3 py-2 text-sm font-semibold bg-red-500/15 text-red-600'
                  : 'rounded-xl px-3 py-2 text-sm border border-border text-muted-foreground'
              }
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={
                type === 'income'
                  ? 'rounded-xl px-3 py-2 text-sm font-semibold bg-emerald-500/15 text-emerald-600'
                  : 'rounded-xl px-3 py-2 text-sm border border-border text-muted-foreground'
              }
            >
              Pemasukan
            </button>
          </div>
          <Button disabled={!canCreate || create.isPending} onClick={submit} className="w-full">
            {create.isPending ? 'Menyimpan…' : 'Tambah'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
