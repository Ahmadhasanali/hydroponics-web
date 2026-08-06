import { usePhReport, isReportComplete } from '../hooks/useReports'
import type { ReportParams } from '../types'
import { ReportStats } from './ReportStats'

interface PhDownReportProps {
  params: Partial<ReportParams>
}

export function PhDownReport({ params }: PhDownReportProps) {
  const { data: agg, isPending } = usePhReport(params)

  if (!isReportComplete(params)) {
    return <p className="text-sm text-muted-foreground">pilih farm, tank, dan rentang tanggal</p>
  }
  if (isPending) return <p className="text-sm text-muted-foreground">Memuat laporan...</p>
  if (!agg) { return <p className="text-sm text-muted-foreground">Tidak ada data pH Down pada rentang tersebut.</p> }

  return (
    <ReportStats
      stats={{
        'Jumlah Pencatatan pH Down': agg.count,
        'Total pH Down (ml)': agg.total_ph_down_ml,
      }}
    />
  )
}