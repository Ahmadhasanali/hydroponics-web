import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { useFarms } from '../../farms/hooks/useFarms'
import { useFinancialSummary } from '../hooks/useFinancialData'
import { formatRupiah, toISO } from '../utils/format'

function monthRange(date: Date): { from: string; to: string } {
  const from = new Date(date.getFullYear(), date.getMonth(), 1)
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return { from: toISO(from), to: toISO(to) }
}

function deltaLabel(current: number, prev: number): { text: string; positive: boolean | null } {
  if (prev === 0) return { text: current === 0 ? '—' : 'baru', positive: null }
  const pct = ((current - prev) / Math.abs(prev)) * 100
  const arrow = pct > 0 ? '↑' : pct < 0 ? '↓' : '→'
  return { text: `${arrow} ${Math.abs(pct).toFixed(0)}%`, positive: pct > 0 ? true : pct < 0 ? false : null }
}

export function FinanceWidget() {
  const { data: farms } = useFarms()
  const farmId = farms?.[0]?.id ?? ''

  const now = useMemo(() => new Date(), [])
  const currRange = useMemo(() => monthRange(now), [now])
  const prevRange = useMemo(() => {
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return monthRange(prev)
  }, [now])

  const { data: curr } = useFinancialSummary({ farmId, from: currRange.from, to: currRange.to, groupBy: 'month' })
  const { data: prev } = useFinancialSummary({ farmId, from: prevRange.from, to: prevRange.to, groupBy: 'month' })

  if (!farms || farms.length === 0) return null
  if (farmId === '') return null

  const net = curr?.net ?? 0
  const income = curr?.income ?? 0
  const expense = curr?.expense ?? 0
  const netDelta = deltaLabel(net, prev?.net ?? 0)
  const incomeDelta = deltaLabel(income, prev?.income ?? 0)
  const expenseDelta = deltaLabel(expense, prev?.expense ?? 0)

  return (
    <Link to="/finance" className="block">
      <Card className="transition-colors hover:bg-muted/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
              <Wallet className="size-4" />
            </span>
            Keuangan bulan ini
          </CardTitle>
          <span className="text-xs text-muted-foreground">Lihat →</span>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Net</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-foreground">{formatRupiah(net)}</p>
              <span
                className={
                  netDelta.positive === null
                    ? 'text-xs text-muted-foreground'
                    : netDelta.positive
                      ? 'text-xs font-semibold text-emerald-600'
                      : 'text-xs font-semibold text-red-600'
                }
              >
                {netDelta.text}
              </span>
              <span className="text-xs text-muted-foreground">vs bulan lalu</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Pemasukan</p>
              <p className="text-sm font-semibold text-emerald-600">{formatRupiah(income)}</p>
              <p
                className={
                  incomeDelta.positive === null
                    ? 'text-xs text-muted-foreground'
                    : incomeDelta.positive
                      ? 'text-xs font-semibold text-emerald-600'
                      : 'text-xs font-semibold text-red-600'
                }
              >
                {incomeDelta.text} vs lalu
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pengeluaran</p>
              <p className="text-sm font-semibold text-red-600">{formatRupiah(expense)}</p>
              <p
                className={
                  expenseDelta.positive === null
                    ? 'text-xs text-muted-foreground'
                    : expenseDelta.positive
                      ? 'text-xs font-semibold text-emerald-600'
                      : 'text-xs font-semibold text-red-600'
                }
              >
                {expenseDelta.text} vs lalu
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
