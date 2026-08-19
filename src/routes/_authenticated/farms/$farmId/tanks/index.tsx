import { createFileRoute, Link } from '@tanstack/react-router'
import { TankList } from '../../../../../features/tanks/components/TankList'
import { useFarm } from '../../../../../features/farms/hooks/useFarms'

export const Route = createFileRoute('/_authenticated/farms/$farmId/tanks/')({
  component: TankListPage,
})

function TankListPage() {
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
        className="text-sm text-secondary hover:text-foreground"
      >
        &larr; {farm?.name ?? 'Kembali ke farm'}
      </Link>
      <TankList farmId={id} />
    </div>
  )
}
