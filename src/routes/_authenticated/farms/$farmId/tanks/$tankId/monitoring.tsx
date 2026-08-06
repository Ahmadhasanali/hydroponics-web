import { createFileRoute, Link } from '@tanstack/react-router'
import { MonitoringList } from '../../../../../../features/monitoring/components/MonitoringList'

export const Route = createFileRoute(
  '/_authenticated/farms/$farmId/tanks/$tankId/monitoring',
)({
  component: MonitoringPage,
})

function MonitoringPage() {
  const { farmId, tankId } = Route.useParams()
  const farmNum = Number(farmId)
  const tankNum = Number(tankId)

  if (!farmId || !tankId || Number.isNaN(farmNum) || Number.isNaN(tankNum)) {
    return <p className="text-sm text-red-500">ID farm atau tank tidak valid.</p>
  }

  return (
    <div className="space-y-6">
      <Link
        to="/farms/$farmId/tanks/$tankId"
        params={{ farmId, tankId }}
        className="text-sm text-blue-600 hover:underline"
      >
        &larr; Kembali ke detail tank
      </Link>
      <MonitoringList farmId={farmNum} tankId={tankNum} />
    </div>
  )
}