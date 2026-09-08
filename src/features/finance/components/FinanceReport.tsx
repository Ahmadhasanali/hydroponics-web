import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { useFinancialSummary } from '../hooks/useFinancialData'
import type { GroupBy } from '../types'
import { formatDate, formatRupiah, toISO } from '../utils/format'

function defaultRange(): { from: string; to: string } {
  const now = new Date()
  const fromDate = new Date(now)
  fromDate.setDate(now.getDate() - 29)
  return { from: toISO(fromDate), to: toISO(now) }
}

export function FinanceReport({ farmId }: { farmId: number | '' }) {
  const initial = useMemo(() => defaultRange(), [])
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [groupBy, setGroupBy] = useState<GroupBy>('day')

  const { data: summary, isLoading, isError } = useFinancialSummary({ farmId, from, to, groupBy })

  if (farmId === '') {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Pilih farm untuk melihat laporan keuangan.
        </CardContent>
      </Card>
    )
  }

  const categories = summary?.categories ?? []
  const series = summary?.series ?? []
  const maxTotal = Math.max(...categories.map((c) => c.total), 1)
  const maxSeriesVal = Math.max(...series.flatMap((s) => [s.income, s.expense]), 1)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Dari
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Sampai
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Group
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="day">Harian</option>
            <option value="week">Mingguan</option>
            <option value="month">Bulanan</option>
          </select>
        </label>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Memuat laporan...</p>
      ) : isError ? (
        <p className="py-8 text-center text-sm text-red-600">Gagal memuat laporan.</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Pemasukan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-emerald-600">{formatRupiah(summary?.income ?? 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Pengeluaran</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-red-600">{formatRupiah(summary?.expense ?? 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Net</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-foreground">{formatRupiah(summary?.net ?? 0)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Breakdown Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Belum ada data kategori.</p>
              ) : (
                <ul className="space-y-3">
                  {categories.map((c) => (
                    <li key={`${c.category}-${c.type}`} className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="font-medium text-foreground">
                          {c.category}
                          <span
                            className={
                              c.type === 'income'
                                ? 'ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-600'
                                : 'ml-2 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-600'
                            }
                          >
                            {c.type === 'income' ? 'Masuk' : 'Keluar'}
                          </span>
                        </span>
                        <span className="text-sm font-medium text-foreground">{formatRupiah(c.total)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={c.type === 'income' ? 'h-full rounded-full bg-emerald-500' : 'h-full rounded-full bg-red-500'}
                          style={{ width: `${(c.total / maxTotal) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Tren</CardTitle>
            </CardHeader>
            <CardContent>
              {series.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Belum ada data tren.</p>
              ) : (
                <div className="flex items-end gap-1 overflow-x-auto pb-2">
                  {series.map((point) => (
                    <div key={point.period} className="flex min-w-10 flex-col items-center gap-1">
                      <div className="flex h-24 items-end gap-1">
                        <div
                          className="w-3 rounded-t bg-emerald-500"
                          title={`Masuk: ${formatRupiah(point.income)}`}
                          style={{ height: `${Math.max((point.income / maxSeriesVal) * 100, point.income > 0 ? 4 : 0)}%` }}
                        />
                        <div
                          className="w-3 rounded-t bg-red-500"
                          title={`Keluar: ${formatRupiah(point.expense)}`}
                          style={{ height: `${Math.max((point.expense / maxSeriesVal) * 100, point.expense > 0 ? 4 : 0)}%` }}
                        />
                      </div>
                      <span className="max-w-16 truncate text-[10px] text-muted-foreground" title={formatDate(point.period)}>
                        {formatDate(point.period)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
