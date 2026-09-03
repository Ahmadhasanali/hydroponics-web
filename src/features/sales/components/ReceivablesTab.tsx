import { useState } from 'react'
import { formatDate, formatRupiah } from '../../finance/utils/format'
import { useReceivables, useReceivableSummary } from '../hooks/useSalesData'
import { PaymentDialog } from './PaymentDialog'

export function ReceivablesTab({ farmId }: { farmId: number }) {
  const { data: page } = useReceivables(farmId)
  const { data: summary } = useReceivableSummary(farmId)
  const [payingSale, setPayingSale] = useState<{ id: number; remaining: number } | null>(null)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-xl bg-red-500/10 p-3">
          <p className="text-xs text-muted-foreground">Total piutang</p>
          <p className="font-bold text-red-600">{formatRupiah(summary?.total_remaining ?? 0)}</p>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <p className="text-xs text-muted-foreground">Pelanggan</p>
          <p className="font-bold">{summary?.customer_count ?? 0}</p>
        </div>
        <div className="rounded-xl bg-amber-500/10 p-3">
          <p className="text-xs text-muted-foreground">Lewat tempo</p>
          <p className="font-bold text-amber-600">{summary?.overdue_count ?? 0}</p>
        </div>
      </div>

      {(page?.data ?? []).map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
          <div>
            <p className="text-sm font-semibold">{item.customer?.name ?? 'Pelanggan'}</p>
            <p className={`text-xs ${item.overdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
              Jatuh tempo {item.due_date ? formatDate(item.due_date) : '—'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">{formatRupiah(item.remaining_amount)}</p>
            <button className="text-xs font-semibold text-primary" onClick={() => setPayingSale({ id: item.id, remaining: item.remaining_amount })}>
              Catat pembayaran
            </button>
          </div>
        </div>
      ))}

      {payingSale ? (
        <PaymentDialog
          open
          onClose={() => setPayingSale(null)}
          farmId={farmId}
          saleId={payingSale.id}
          maxAmount={payingSale.remaining}
        />
      ) : null}
    </div>
  )
}
