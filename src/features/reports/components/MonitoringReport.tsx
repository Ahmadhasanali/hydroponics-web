import { useMonitoringReport, isReportComplete } from '../hooks/useReports'
import type { ReportParams } from '../types'
import { ReportStats } from './ReportStats'

interface MonitoringReportProps {
  params: Partial<ReportParams>
}

export function MonitoringReport({ params }: MonitoringReportProps) {
  const { data: agg, isPending } = useMonitoringReport(params)

  if (!isReportComplete(params)) {
    return <p className="text-sm text-muted-foreground">pilih farm, tank, dan rentang tanggal</p>
  }
  if (isPending) return <p className="text-sm text-muted-foreground">Memuat laporan...</p>
  if (!agg) return <p className="text-sm text-muted-foreground">Tidak ada data monitoring pada rentang tersebut.</p>

  return (
    <ReportStats
      stats={{
        'Jumlah Catatan': agg.count,
        'Rata-rata PPM': agg.avg_ppm,
        'PPM Tertinggi': agg.highest_ppm,
        'PPM Terendah': agg.lowest_ppm,
        'Rata-rata pH': agg.avg_ph,
        'pH Tertinggi': agg.highest_ph,
        'pH Terendah': agg.lowest_ph,
      }}
    />
  )
}