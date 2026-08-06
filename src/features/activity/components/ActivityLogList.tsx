import { useState } from 'react'
import { useActivityLogs } from '../hooks/useActivityLogs'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'

function formatDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ActivityLogList({ farmId }: { farmId: number }) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching } = useActivityLogs(farmId, page)

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat aktivitas...</p>
  if (isError) return <p className="text-sm text-red-600">Gagal memuat aktivitas.</p>

  const logs = data?.data ?? []
  const meta = data?.meta

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
        ) : (
          <ul className="space-y-3">
            {logs.map((log) => (
              <li key={log.id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p>{log.description}</p>
                  {(log.user?.name ?? log.staff?.name) && (
                    <p className="text-xs text-muted-foreground">
                      {log.user?.name ?? log.staff?.name}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(log.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between text-sm">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </Button>
            <span className="text-muted-foreground">
              Halaman {meta.current_page} dari {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.last_page || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
