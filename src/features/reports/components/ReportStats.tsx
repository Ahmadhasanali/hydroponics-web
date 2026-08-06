import { Card, CardContent } from '../../../components/ui/card'

interface ReportStatsProps {
  stats: Record<string, number | null>
}

export function ReportStats({ stats }: ReportStatsProps) {
  const entries = Object.entries(stats)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([label, value]) => (
        <Card key={label}>
          <CardContent>
            <div className="truncate text-sm font-semibold tracking-[0.25em] text-slate-500 uppercase">{label}</div>
            <div className="mt-1 text-3xl font-semibold text-slate-900">{value == null ? '–' : value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}