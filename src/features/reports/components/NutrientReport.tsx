import { useNutrientReport, isReportComplete } from '../hooks/useReports'
import type { ReportParams } from '../types'
import { ReportStats } from './ReportStats'

interface NutrientReportProps {
  params: Partial<ReportParams>
}

export function NutrientReport({ params }: NutrientReportProps) {
  const { data: agg, isPending } = useNutrientReport(params)

  if (!isReportComplete(params)) {
    return <p className="text-sm text-muted-foreground">pilih farm, tank, dan rentang tanggal</p>
  }
  if (isPending) return <p className="text-sm text-muted-foreground">Memuat laporan...</p>
  if (!agg) return <p className="text-sm text-muted-foreground">Tidak ada data nutrisi pada rentang tersebut.</p>

  return (
    <ReportStats
      stats={{
        'Jumlah Pencatatan Nutrisi': agg.count,
        'Total Nutrisi A (ml)': agg.total_nutrient_a_ml,
        'Total Nutrisi B (ml)': agg.total_nutrient_b_ml,
      }}
    />
  )
}