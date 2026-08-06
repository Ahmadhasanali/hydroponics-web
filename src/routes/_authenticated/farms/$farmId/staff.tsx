import { createFileRoute, Link } from '@tanstack/react-router'
import { StaffList } from '../../../../features/staff/components/StaffList'
import { useFarm } from '../../../../features/farms/hooks/useFarms'

export const Route = createFileRoute('/_authenticated/farms/$farmId/staff')({
  component: StaffPage,
})

function StaffPage() {
  const { farmId } = Route.useParams()
  const id = Number(farmId)
  const { data: farm } = useFarm(id)

  if (!farmId || Number.isNaN(id)) {
    return <p className="text-sm text-red-600">ID farm tidak valid.</p>
  }

  return (
    <div className="space-y-6">
      <Link
        to="/farms/$farmId"
        params={{ farmId }}
        className="text-sm text-[#d4a020] hover:text-[#8a6d00] hover:underline"
      >
        &larr; {farm?.name ?? 'Kembali ke farm'}
      </Link>
      <StaffList farmId={id} />
    </div>
  )
}
