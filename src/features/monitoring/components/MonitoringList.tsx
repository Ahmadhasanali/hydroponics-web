import { useState } from 'react'
import type { DailyMonitoring } from '../types'
import { useMonitoring, useDeleteMonitoring } from '../hooks/useMonitoring'
import { formatDate } from '../../finance/utils/format'
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
  if (isError) return <p className="text-sm text-red-600">Gagal memuat riwayat monitoring.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Monitoring</h1>
        <Button
          onClick={() => {
            setEditing(undefined)
            setCreateOpen(true)
          }}
        >
          Catat Monitoring
        </Button>
      </div>

      {records?.length ? (
        <>
          <div className="hidden md:block rounded-md border">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>PPM</TableHead>
                <TableHead>pH</TableHead>
                <TableHead>Suhu (°C)</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.log_date)}</TableCell>
                  <TableCell>{record.ppm}</TableCell>
                  <TableCell>{record.ph}</TableCell>
                  <TableCell>
                    {record.water_temperature != null ? record.water_temperature : '–'}
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
                        Ubah
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Hapus log monitoring tanggal ${formatDate(record.log_date)}?`)) {
                            deleteMonitoring.mutate(record.id)
                          }
                        }}
                        disabled={deleteMonitoring.isPending}
                      >
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {records.map((record) => (
              <div key={record.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{formatDate(record.log_date)}</p>
                  <span className="text-xs text-muted-foreground">{record.user?.name ?? ''}</span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">PPM</dt>
                    <dd className="font-medium">{record.ppm}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">pH</dt>
                    <dd className="font-medium">{record.ph}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Suhu (°C)</dt>
                    <dd className="font-medium">
                      {record.water_temperature != null ? record.water_temperature : '–'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Catatan</dt>
                    <dd className="font-medium">{record.notes || '–'}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(record)
                      setCreateOpen(true)
                    }}
                  >
                    Ubah
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (window.confirm(`Hapus log monitoring tanggal ${formatDate(record.log_date)}?`)) {
                        deleteMonitoring.mutate(record.id)
                      }
                    }}
                    disabled={deleteMonitoring.isPending}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
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

      <MonitoringForm open={createOpen} onOpenChange={setCreateOpen} tankId={tankId} record={editing} />
    </div>
  )
}