import { formatDate, formatRupiah } from '../../finance/utils/format'
import { useSales } from '../hooks/useSalesData'

const badge: Record<string, string> = {
  unpaid: 'bg-red-500/15 text-red-600',
  partial: 'bg-amber-500/15 text-amber-600',
  paid: 'bg-emerald-500/15 text-emerald-600',
}
const label: Record<string, string> = { unpaid: 'Belum bayar', partial: 'Sebagian', paid: 'Lunas' }

export function SaleList({ farmId }: { farmId: number }) {
  const { data: page } = useSales(farmId)
  const sales = page?.data ?? []

  if (sales.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Belum ada penjualan.</p>
  }

  return (
    <ul className="space-y-2">
      {sales.map((sale) => (
        <li key={sale.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
          <div>
            <p className="text-sm font-semibold">{sale.customer?.name ?? 'Pelanggan'}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(sale.sale_date)}
              {sale.due_date ? ` · tempo ${formatDate(sale.due_date)}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge[sale.status] ?? ''}`}>
              {label[sale.status] ?? sale.status}
            </span>
            <p className="text-sm font-bold">{formatRupiah(sale.total_amount)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
