import { useState } from 'react'
import type { DailyMonitoring } from '../types'
import { useMonitoring, useDeleteMonitoring } from '../hooks/useMonitoring'
import { MonitoringForm } from './MonitoringForm'
import { Button } from '../../../components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../../components/ui/table'

export function MonitoringList({ farmId, tankId }: { farmId: number; tankId: number }) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching } = useMonitoring(farmId, page)
  const deleteMonitoring = useDeleteMonitoring()
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<DailyMonitoring | undefined>(undefined)

  const records = data?.data.filter((m) => m.tank_id === tankId) ?? []
  const meta = data?.meta

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat riwayat monitoring...</p>
  if (isError) return <p className="text-sm text-red-500">Gagal memuat riwayat monitoring.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Monitoring</h1>
        <Button
          onClick={() => {
            setEditing(undefined)
            setCreateOpen(true)
          }}
        >
          Add Monitoring
        </Button>
      </div>

      {records?.length ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Log Date</TableHead>
                <TableHead>PPM</TableHead>
                <TableHead>pH</TableHead>
                <TableHead>Temp (°C)</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.log_date}</TableCell>
                  <TableCell>{record.ppm}</TableCell>
                  <TableCell>{record.ph}</TableCell>
                  <TableCell>
                    {record.water_temperature !== undefined ? record.water_temperature : '–'}
                  </TableCell>
                  <TableCell>{record.notes || '–'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(record)
                          setCreateOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Hapus log monitoring tanggal ${record.log_date}?`)) {
                            deleteMonitoring.mutate(record.id)
                          }
                        }}
                        disabled={deleteMonitoring.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Belum ada data monitoring untuk tank ini.</p>
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <span className="text-muted-foreground">
            Page {meta.current_page} of {meta.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.last_page || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <MonitoringForm open={createOpen} onOpenChange={setCreateOpen} tankId={tankId} record={editing} />
    </div>
  )
}