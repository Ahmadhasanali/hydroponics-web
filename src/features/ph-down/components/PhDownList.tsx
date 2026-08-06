import { useState } from 'react'
import type { PhDownLog } from '../types'
import { usePhDown, useDeletePhDown } from '../hooks/usePhDown'
import { PhDownForm } from './PhDownForm'
import { Button } from '../../../components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../../components/ui/table'

export function PhDownList({ farmId, tankId }: { farmId: number; tankId: number }) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching } = usePhDown(farmId, page)
  const deletePhDown = useDeletePhDown()
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<PhDownLog | undefined>(undefined)

  const records = data?.data.filter((n) => n.tank_id === tankId) ?? []
  const meta = data?.meta

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat riwayat pH down...</p>
  if (isError) return <p className="text-sm text-red-600">Gagal memuat riwayat pH down.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">pH Down</h1>
        <Button
          onClick={() => {
            setEditing(undefined)
            setCreateOpen(true)
          }}
        >
          Add pH Down
        </Button>
      </div>

      {records?.length ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Log Date</TableHead>
                <TableHead>pH Before</TableHead>
                <TableHead>pH After</TableHead>
                <TableHead>Down (ml)</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.log_date}</TableCell>
                  <TableCell>{record.ph_before}</TableCell>
                  <TableCell>{record.ph_after}</TableCell>
                  <TableCell>{record.ph_down_ml}</TableCell>
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
                          if (window.confirm(`Hapus pH down tanggal ${record.log_date}?`)) {
                            deletePhDown.mutate(record.id)
                          }
                        }}
                        disabled={deletePhDown.isPending}
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
        <p className="text-sm text-muted-foreground">Belum ada data pH down untuk tank ini.</p>
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

      <PhDownForm open={createOpen} onOpenChange={setCreateOpen} tankId={tankId} record={editing} />
    </div>
  )
}