import { useState } from 'react'
import type { Staff } from '../types'
import { useFarmStaff, useToggleStaff, useDeleteStaff } from '../hooks/useStaff'
import { StaffForm } from './StaffForm'
import { StaffPasswordDialog } from './StaffPasswordDialog'
import { Button } from '../../../components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/table'

export function StaffList({ farmId }: { farmId: number }) {
  const { data: staff, isLoading, isError } = useFarmStaff(farmId)
  const toggleStaff = useToggleStaff()
  const deleteStaff = useDeleteStaff()
  const [createOpen, setCreateOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<Staff | null>(null)

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat daftar petugas...</p>
  if (isError) return <p className="text-sm text-red-600">Gagal memuat daftar petugas.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Petugas</h1>
        <Button onClick={() => setCreateOpen(true)}>Tambah Petugas</Button>
      </div>

      {staff?.length ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.username}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold tracking-[0.24em] uppercase ${
                        member.is_active
                          ? 'bg-[#cbe273]/25 text-[#a3c44a]'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {member.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStaff.mutate({ farmId, staffId: member.id })}
                        disabled={toggleStaff.isPending}
                      >
                        {member.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setResetTarget(member)}
                      >
                        Reset Password
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Hapus petugas "${member.name}"?`)) {
                            deleteStaff.mutate({ farmId, staffId: member.id })
                          }
                        }}
                        disabled={deleteStaff.isPending}
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
        <p className="text-sm text-muted-foreground">Belum ada petugas.</p>
      )}

      <StaffForm open={createOpen} onOpenChange={setCreateOpen} farmId={farmId} />
      <StaffPasswordDialog
        farmId={farmId}
        target={resetTarget}
        onClose={() => setResetTarget(null)}
      />
    </div>
  )
}
