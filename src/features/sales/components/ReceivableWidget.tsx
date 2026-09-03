import { Link } from '@tanstack/react-router'
import { HandCoins } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { useFarms } from '../../farms/hooks/useFarms'
import { useReceivableSummary } from '../hooks/useSalesData'
import { formatRupiah } from '../../finance/utils/format'

export function ReceivableWidget() {
  const { data: farms } = useFarms()
  const farmId = farms?.[0]?.id ?? ''
  const { data: summary } = useReceivableSummary(farmId)

  if (!farms || farms.length === 0 || farmId === '') return null

  return (
    <Link to="/sales" className="block">
      <Card className="transition-colors hover:bg-muted/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/15 text-red-600">
              <HandCoins className="size-4" />
            </span>
            Piutang belum dibayar
          </CardTitle>
          <span className="text-xs text-muted-foreground">Lihat →</span>
        </CardHeader>
        <CardContent className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-red-600">{formatRupiah(summary?.total_remaining ?? 0)}</p>
            <p className="text-xs text-muted-foreground">{summary?.customer_count ?? 0} warung/toko</p>
          </div>
          {(summary?.overdue_count ?? 0) > 0 && (
            <span className="rounded-full bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-600">
              {summary?.overdue_count} lewat tempo
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
