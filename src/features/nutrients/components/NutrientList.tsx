import { useState } from 'react'
import type { NutrientAddition } from '../types'
import { useNutrients, useDeleteNutrient } from '../hooks/useNutrients'
import { formatDate } from '../../finance/utils/format'
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
        <h1 className="text-2xl font-semibold text-foreground">AB Mix</h1>
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
        <>
          <div className="hidden md:block rounded-md border">
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
                  <TableCell>{formatDate(record.log_date)}</TableCell>
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
                          if (window.confirm(`Hapus penambahan nutrisi tanggal ${formatDate(record.log_date)}?`)) {
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

          <div className="space-y-3 md:hidden">
            {records.map((record) => (
              <div key={record.id} className="rounded-2xl border border-border bg-card p-4">
                <p className="font-medium">{formatDate(record.log_date)}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">PPM Sebelum</dt>
                    <dd className="font-medium">{record.ppm_before}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">PPM Setelah</dt>
                    <dd className="font-medium">{record.ppm_after}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">A (ml)</dt>
                    <dd className="font-medium">{record.nutrient_a_ml}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">B (ml)</dt>
                    <dd className="font-medium">{record.nutrient_b_ml}</dd>
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
                      if (window.confirm(`Hapus penambahan nutrisi tanggal ${formatDate(record.log_date)}?`)) {
                        deleteNutrient.mutate(record.id)
                      }
                    }}
                    disabled={deleteNutrient.isPending}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
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