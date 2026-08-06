import { createFileRoute, Link } from '@tanstack/react-router'
import { ReminderList } from '../../../../features/reminders/components/ReminderList'
import { useFarm } from '../../../../features/farms/hooks/useFarms'

export const Route = createFileRoute('/_authenticated/farms/$farmId/reminders')({
  component: RemindersPage,
})

function RemindersPage() {
  const { farmId } = Route.useParams()
  const id = Number(farmId)
  const { data: farm } = useFarm(id)

  if (!farmId || Number.isNaN(id)) {
    return <p className="text-sm text-red-500">ID farm tidak valid.</p>
  }

  return (
    <div className="space-y-6">
      <Link
        to="/farms/$farmId"
        params={{ farmId }}
        className="text-sm text-blue-600 hover:underline"
      >
        &larr; {farm?.name ?? 'Kembali ke farm'}
      </Link>
      <ReminderList key={farmId} farmId={id} />
    </div>
  )
}
