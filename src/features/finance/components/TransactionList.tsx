import { useMemo, useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardContent } from '../../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { useDeleteTransaction, useFinancialTransactions } from '../hooks/useFinancialData'
import { formatDate, formatRupiah } from '../utils/format'
import type { TransactionFilters } from '../types'

interface TransactionListProps {
  farmId: number | ''
}

export function TransactionList({ farmId }: TransactionListProps) {
  const [page, setPage] = useState(1)
  const [type, setType] = useState<'' | 'income' | 'expense'>('')
  const [search, setSearch] = useState('')
  const del = useDeleteTransaction()

  const filters: TransactionFilters = useMemo(
    () => ({
      farm_id: farmId,
      type: type === '' ? undefined : type,
      search: search.trim() === '' ? undefined : search.trim(),
      page,
    }),
    [farmId, type, search, page],
  )

  const { data, isLoading, isError } = useFinancialTransactions(filters)

  const rows = data?.data ?? []
  const meta = data?.meta

  if (farmId === '') {
    return <p className="py-8 text-center text-sm text-muted-foreground">Pilih farm untuk melihat transaksi.</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          <Button variant={type === '' ? 'default' : 'outline'} size="sm" onClick={() => { setType(''); setPage(1) }}>
            Semua
          </Button>
          <Button
            variant={type === 'expense' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setType('expense'); setPage(1) }}
          >
            Keluar
          </Button>
          <Button
            variant={type === 'income' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setType('income'); setPage(1) }}
          >
            Masuk
          </Button>
        </div>
        <Input
          placeholder="Cari catatan / kategori…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="sm:ml-auto sm:max-w-[260px]"
        />
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Memuat…</p>
      ) : isError ? (
        <p className="py-8 text-center text-sm text-destructive">Gagal memuat transaksi.</p>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Belum ada transaksi.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(t.transaction_date)}</TableCell>
                    <TableCell>{t.category.name}</TableCell>
                    <TableCell>
                      <span
                        className={
                          t.type === 'income'
                            ? 'rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-600'
                            : 'rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-600'
                        }
                      >
                        {t.type === 'income' ? 'Masuk' : 'Keluar'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatRupiah(t.amount)}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">{t.note ?? '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        disabled={del.isPending}
                        onClick={() => del.mutate(t.id)}
                      >
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-2 md:hidden">
            {rows.map((t) => (
              <Card key={t.id} size="sm">
                <CardContent className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{t.category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(t.transaction_date)} · {t.type === 'income' ? 'Masuk' : 'Keluar'}
                      {t.note ? ` · ${t.note}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}
                      {formatRupiah(t.amount)}
                    </p>
                    <button
                      type="button"
                      disabled={del.isPending}
                      onClick={() => del.mutate(t.id)}
                      className="text-xs text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50"
                    >
                      Hapus
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {meta && meta.last_page > 1 ? (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Hal {meta.current_page} dari {meta.last_page} · {meta.total} transaksi
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
