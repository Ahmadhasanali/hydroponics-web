import { Card, CardContent } from '../../../components/ui/card'

interface ReportStatsProps {
  stats: Record<string, number>
}

export function ReportStats({ stats }: ReportStatsProps) {
  const entries = Object.entries(stats)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([label, value]) => (
        <Card key={label}>
          <CardContent>
            <div className="text-xs font-medium text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-semibold">{value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}