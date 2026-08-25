import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { FarmPicker } from '../../features/finance/components/FarmPicker'
import { TransactionList } from '../../features/finance/components/TransactionList'
import { TransactionFormDialog } from '../../features/finance/components/TransactionFormDialog'
import { CategoryManagerModal } from '../../features/finance/components/CategoryManagerModal'
import { FinanceReport } from '../../features/finance/components/FinanceReport'
import { useFinancialCategories, useFinancialSummary } from '../../features/finance/hooks/useFinancialData'
import { formatRupiah, toISO } from '../../features/finance/utils/format'

export const Route = createFileRoute('/_authenticated/finance')({
  component: FinancePage,
})

function monthRange(date: Date): { from: string; to: string } {
  const from = new Date(date.getFullYear(), date.getMonth(), 1)
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return { from: toISO(from), to: toISO(to) }
}

function deltaLabel(current: number, prev: number): { text: string; positive: boolean | null } {
  if (prev === 0) return { text: current === 0 ? '—' : 'baru', positive: null }
  const pct = ((current - prev) / Math.abs(prev)) * 100
  const sign = pct > 0 ? '↑' : pct < 0 ? '↓' : '→'
  return { text: `${sign} ${Math.abs(pct).toFixed(0)}%`, positive: pct > 0 ? true : pct < 0 ? false : null }
}

function deltaClass(positive: boolean | null, inverted = false): string {
  if (positive === null) return 'text-muted-foreground'
  if (inverted) return positive ? 'text-red-600' : 'text-emerald-600'
  return positive ? 'text-emerald-600' : 'text-red-600'
}

function FinancePage() {
  const [farmId, setFarmId] = useState<number | ''>('')
  const [txOpen, setTxOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)

  const { data: categories = [] } = useFinancialCategories(farmId)

  const now = useMemo(() => new Date(), [])
  const currRange = useMemo(() => monthRange(now), [now])
  const prevRange = useMemo(() => {
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return monthRange(prev)
  }, [now])

  const { data: currSummary } = useFinancialSummary({
    farmId,
    from: currRange.from,
    to: currRange.to,
    groupBy: 'month',
  })
  const { data: prevSummary } = useFinancialSummary({
    farmId,
    from: prevRange.from,
    to: prevRange.to,
    groupBy: 'month',
  })

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Keuangan</h1>
        <p className="text-sm text-muted-foreground">Kelola pemasukan dan pengeluaran per farm.</p>
      </div>

      <div className="max-w-xs">
        <FarmPicker value={farmId} onChange={setFarmId} />
      </div>

      {farmId === '' ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Pilih farm untuk melihat ringkasan dan transaksi.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Pemasukan bulan ini</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-emerald-600">{formatRupiah(currSummary?.income ?? 0)}</p>
              {(() => {
                const d = deltaLabel(currSummary?.income ?? 0, prevSummary?.income ?? 0)
                return (
                  <p className={`text-xs font-medium ${deltaClass(d.positive)}`}>
                    {d.text} <span className="font-normal text-muted-foreground">vs bulan lalu</span>
                  </p>
                )
              })()}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Pengeluaran bulan ini</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-red-600">{formatRupiah(currSummary?.expense ?? 0)}</p>
              {(() => {
                const d = deltaLabel(currSummary?.expense ?? 0, prevSummary?.expense ?? 0)
                return (
                  <p className={`text-xs font-medium ${deltaClass(d.positive, true)}`}>
                    {d.text} <span className="font-normal text-muted-foreground">vs bulan lalu</span>
                  </p>
                )
              })()}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Net bulan ini</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-foreground">{formatRupiah(currSummary?.net ?? 0)}</p>
              {(() => {
                const d = deltaLabel(currSummary?.net ?? 0, prevSummary?.net ?? 0)
                return (
                  <p className={`text-xs font-medium ${deltaClass(d.positive)}`}>
                    {d.text} <span className="font-normal text-muted-foreground">vs bulan lalu</span>
                  </p>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="transaksi">
        <TabsList>
          <TabsTrigger value="transaksi">Transaksi</TabsTrigger>
          <TabsTrigger value="laporan">Laporan</TabsTrigger>
          <TabsTrigger value="kategori">Kategori</TabsTrigger>
        </TabsList>

        <TabsContent value="transaksi" className="space-y-3 pt-4">
          <div className="flex justify-end">
            <Button disabled={farmId === ''} onClick={() => setTxOpen(true)}>
              + Transaksi
            </Button>
          </div>
          <TransactionList farmId={farmId} />
        </TabsContent>

        <TabsContent value="laporan" className="pt-4">
          <FinanceReport farmId={farmId} />
        </TabsContent>

        <TabsContent value="kategori" className="space-y-3 pt-4">
          <div className="flex justify-end">
            <Button variant="outline" disabled={farmId === ''} onClick={() => setCatOpen(true)}>
              Kelola Kategori
            </Button>
          </div>
          {farmId === '' ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Pilih farm untuk mengelola kategori.</p>
          ) : categories.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Belum ada kategori.</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
                  <span className="text-sm font-medium text-foreground">
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
                  </span>
                  {!c.is_active ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">nonaktif</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      {farmId !== '' ? (
        <>
          <TransactionFormDialog
            open={txOpen}
            onClose={() => setTxOpen(false)}
            farmId={Number(farmId)}
            categories={categories}
          />
          <CategoryManagerModal
            open={catOpen}
            onClose={() => setCatOpen(false)}
            farmId={Number(farmId)}
            categories={categories}
          />
        </>
      ) : null}
    </div>
  )
}
