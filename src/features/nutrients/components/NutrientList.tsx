import { useState } from 'react'
import type { NutrientAddition } from '../types'
import { useNutrients, useDeleteNutrient } from '../hooks/useNutrients'
import { NutrientForm } from './NutrientForm'
import { Button } from '../../../components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../../components/ui/table'

export function NutrientList({ farmId, tankId }: { farmId: number; tankId: number }) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching } = useNutrients(farmId, page)
  const deleteNutrient = useDeleteNutrient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<NutrientAddition | undefined>(undefined)

  const records = data?.data.filter((n) => n.tank_id === tankId) ?? []
  const meta = data?.meta

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat riwayat nutrisi...</p>
  if (isError) return <p className="text-sm text-red-600">Gagal memuat riwayat nutrisi.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">AB Mix</h1>
        <Button
          onClick={() => {
            setEditing(undefined)
            setCreateOpen(true)
          }}
        >
          Catat AB Mix
        </Button>
      </div>

      {records?.length ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>PPM Sebelum</TableHead>
                <TableHead>PPM Setelah</TableHead>
                <TableHead>A (ml)</TableHead>
                <TableHead>B (ml)</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.log_date}</TableCell>
                  <TableCell>{record.ppm_before}</TableCell>
                  <TableCell>{record.ppm_after}</TableCell>
                  <TableCell>{record.nutrient_a_ml}</TableCell>
                  <TableCell>{record.nutrient_b_ml}</TableCell>
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
                          if (window.confirm(`Hapus penambahan nutrisi tanggal ${record.log_date}?`)) {
                            deleteNutrient.mutate(record.id)
                          }
                        }}
                        disabled={deleteNutrient.isPending}
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
      ) : (
        <p className="text-sm text-muted-foreground">Belum ada data penambahan nutrisi untuk tank ini.</p>
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

      <NutrientForm open={createOpen} onOpenChange={setCreateOpen} tankId={tankId} record={editing} />
    </div>
  )
}