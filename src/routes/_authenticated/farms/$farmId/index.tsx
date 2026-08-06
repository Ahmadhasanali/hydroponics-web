import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../../lib/api'
import type { ApiResponse } from '../../../../lib/types'
import { useFarm } from '../../../../features/farms/hooks/useFarms'
import type { FarmDetail, FarmMember } from '../../../../features/farms/types'
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

export const Route = createFileRoute('/_authenticated/farms/$farmId/')({
  component: FarmDetailPage,
})

function useFarmMembers(id: number) {
  return useQuery({
    queryKey: ['farms', id, 'members'],
    queryFn: () =>
      api
        .get<ApiResponse<{ farm: { users: FarmMember[]; staff: unknown[] } }>>(`/farms/${id}/members`)
        .then((r) => r.data.farm),
    enabled: !!id,
  })
}

function FarmDetailPage() {
  const { farmId } = Route.useParams()
  const id = Number(farmId)
  const { data: farm, isLoading, isError } = useFarm(id)
  const membersQuery = useFarmMembers(id)

  if (!farmId || Number.isNaN(id)) {
    return <p className="text-sm text-red-500">ID farm tidak valid.</p>
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading farm...</p>
  if (isError) return <p className="text-sm text-red-500">Gagal memuat detail farm.</p>

  const detail = farm as FarmDetail
  const members = membersQuery.data?.users ?? []

  return (
    <div className="space-y-6">
      <Link to="/farms" className="text-sm text-blue-600 hover:underline">
        &larr; Kembali ke daftar farm
      </Link>

      <div>
        <h1 className="text-xl font-medium">{detail.name}</h1>
        {detail.location && <p className="text-sm text-muted-foreground">{detail.location}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tanks</CardTitle>
          <CardDescription>
            {detail.tanks?.length ?? 0} tank di farm ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          {detail.tanks?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Capacity (L)</TableHead>
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
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada anggota.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link to="/farms/$farmId/tanks" params={{ farmId: String(id) }}>
          <Button variant="outline">Manage Tanks</Button>
        </Link>
        <Link to="/farms/$farmId/staff" params={{ farmId: String(id) }}>
          <Button variant="outline">Manage Staff</Button>
        </Link>
        <Link to="/farms/$farmId/reminders" params={{ farmId: String(id) }}>
          <Button variant="outline">Manage Reminders</Button>
        </Link>
      </div>
    </div>
  )
}