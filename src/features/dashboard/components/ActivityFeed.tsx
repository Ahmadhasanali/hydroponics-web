import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import type { ActivityLog } from '../../activity/types'
import { activityLogTarget } from '../../activity/lib/activityTarget'

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
        <CardTitle className="font-semibold text-foreground">Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada aktivitas terbaru.</p>
        ) : (
          <ul className="space-y-3">
            {logs.slice(0, 3).map((log) => {
              const target = activityLogTarget(log)
              const content = (
                <>
                  <p className="font-medium text-foreground">{log.description || 'Aktivitas'}</p>
                  {log.user?.name && (
                    <p className="text-xs text-muted-foreground">{log.user.name}</p>
                  )}
                </>
              )
              return (
                <li
                  key={log.id}
                  className="flex items-start gap-3 rounded-[2rem] border border-border bg-card p-4 text-sm"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-sm font-bold text-secondary">
                    {initial(log.user?.name)}
                  </span>
                  {target ? (
                    <Link
                      to={target.to}
                      params={target.params}
                      className="min-w-0 flex-1 text-secondary hover:text-foreground hover:underline"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="min-w-0 flex-1">{content}</div>
                  )}
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(log.created_at)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
