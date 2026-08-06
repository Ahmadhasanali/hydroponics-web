import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import type { ActivityLog } from '../hooks/useDashboard'

function formatDate(value?: string): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function initial(name?: string): string {
  return name?.trim().charAt(0).toUpperCase() ?? 'A'
}

export function ActivityFeed({ logs }: { logs: ActivityLog[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-slate-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        ) : (
          <ul className="space-y-3">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex items-start gap-3 rounded-[2rem] border border-slate-200/60 bg-white p-4 text-sm"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ffce54]/15 text-sm font-bold text-[#d4a020]">
                  {initial(log.user?.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{log.description || log.log_type || 'Activity'}</p>
                  {log.user?.name && (
                    <p className="text-xs text-muted-foreground">{log.user.name}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(log.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
