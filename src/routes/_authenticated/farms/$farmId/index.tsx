import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  useFarm,
  useFarmMembers,
  useAddFarmMember,
  useRemoveFarmMember,
} from '../../../../features/farms/hooks/useFarms'
import { useAuth } from '../../../../hooks/useAuth'
import type { FarmDetail } from '../../../../features/farms/types'
import { Button } from '../../../../components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../../components/ui/table'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../components/ui/dialog'
import { Input } from '../../../../components/ui/input'
import { Label } from '../../../../components/ui/label'

export const Route = createFileRoute('/_authenticated/farms/$farmId/')({
  component: FarmDetailPage,
})

function FarmDetailPage() {
  const { farmId } = Route.useParams()
  const id = Number(farmId)
  const { data: farm, isLoading, isError } = useFarm(id)
  const membersQuery = useFarmMembers(id)
  const { user: currentUser } = useAuth()
  const addMember = useAddFarmMember()
  const removeMember = useRemoveFarmMember()
  const [addOpen, setAddOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  if (!farmId || Number.isNaN(id)) {
    return <p className="text-sm text-red-600">ID farm tidak valid.</p>
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat farm...</p>
  if (isError) return <p className="text-sm text-red-600">Gagal memuat detail farm.</p>

  const detail = farm as FarmDetail
  const members = membersQuery.data?.users ?? []
  const currentRole = members.find((m) => m.id === currentUser?.id)?.role
  const canManage = currentRole === 'owner' || currentRole === 'manager'

  return (
    <div className="space-y-6">
      <Link to="/farms" className="text-sm text-secondary hover:text-foreground hover:underline">
        &larr; Kembali ke daftar farm
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">{detail.name}</h1>
        {detail.address && <p className="text-sm text-muted-foreground">{detail.address}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tank</CardTitle>
          <CardDescription>
            {detail.tanks?.length ?? 0} tank di farm ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          {detail.tanks?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kapasitas (L)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.tanks.map((tank) => (
                  <TableRow key={tank.id}>
                    <TableCell>{tank.name}</TableCell>
                    <TableCell>{tank.capacity_liter}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada tank.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Anggota</CardTitle>
          {canManage && (
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger render={<Button size="sm" />}>Tambah Manager</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Manager</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Label htmlFor="member-email">Email manager</Label>
                  <Input
                    id="member-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {emailError && <p className="text-sm text-red-600">{emailError}</p>}
                  <Button
                    disabled={addMember.isPending}
                    onClick={async () => {
                      setEmailError(null)
                      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        setEmailError('Email tidak valid')
                        return
                      }
                      try {
                        await addMember.mutateAsync({ farmId: id, email })
                        setEmail('')
                        setAddOpen(false)
                      } catch (err: any) {
                        const msg =
                          err?.errors?.email?.[0] || err?.message || 'Gagal menambahkan anggota'
                        setEmailError(msg)
                      }
                    }}
                  >
                    {addMember.isPending ? 'Menambahkan...' : 'Tambahkan'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {deleteError && <p className="mb-2 text-sm text-red-600">{deleteError}</p>}
          {members.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const isOwner = member.role === 'owner'
                  const isSelf = member.id === currentUser?.id
                  const disableDelete = isOwner || isSelf || !canManage || !member.farmUserId
                  return (
                    <TableRow key={member.id}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.email ?? '-'}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={disableDelete || removeMember.isPending}
                          onClick={async () => {
                            if (!window.confirm(`Hapus ${member.name} dari farm?`)) return
                            try {
                              await removeMember.mutateAsync({
                                farmId: id,
                                farmUserId: member.farmUserId!,
                              })
                              setDeleteError(null)
                            } catch (e: any) {
                              setDeleteError(e?.message || 'Gagal menghapus')
                            }
                          }}
                        >
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada anggota.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link to="/farms/$farmId/tanks" params={{ farmId: String(id) }}>
          <Button variant="outline">Kelola Tank</Button>
        </Link>
        <Link to="/farms/$farmId/staff" params={{ farmId: String(id) }}>
          <Button variant="outline">Kelola Petugas</Button>
        </Link>
        <Link to="/farms/$farmId/reminders" params={{ farmId: String(id) }}>
          <Button variant="outline">Kelola Pengingat</Button>
        </Link>
      </div>
    </div>
  )
}