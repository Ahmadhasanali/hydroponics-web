import { createFileRoute } from '@tanstack/react-router'
import { ReminderDetail } from '../../../../../features/reminders/components/ReminderDetail'

export const Route = createFileRoute('/_authenticated/farms/$farmId/reminders/$reminderId')({
  component: ReminderDetailPage,
})

function ReminderDetailPage() {
  const { reminderId } = Route.useParams()
  const id = Number(reminderId)

  if (!reminderId || Number.isNaN(id)) {
    return <p className="text-sm text-red-600">ID reminder tidak valid.</p>
  }

  return (
    <div className="space-y-6">
      <ReminderDetail reminderId={id} />
    </div>
  )
}
