import { createFileRoute, Link } from '@tanstack/react-router'
import { NutrientList } from '../../../../../../features/nutrients/components/NutrientList'

export const Route = createFileRoute(
  '/_authenticated/farms/$farmId/tanks/$tankId/nutrients',
)({
  component: NutrientPage,
})

function NutrientPage() {
  const { farmId, tankId } = Route.useParams()
  const farmNum = Number(farmId)
  const tankNum = Number(tankId)

  if (!farmId || !tankId || Number.isNaN(farmNum) || Number.isNaN(tankNum)) {
    return <p className="text-sm text-red-600">ID farm atau tank tidak valid.</p>
  }

  return (
    <div className="space-y-6">
      <Link
        to="/farms/$farmId/tanks/$tankId"
        params={{ farmId, tankId }}
        className="text-sm text-secondary hover:text-foreground hover:underline"
      >
        &larr; Kembali ke detail tank
      </Link>
      <NutrientList farmId={farmNum} tankId={tankNum} />
    </div>
  )
}