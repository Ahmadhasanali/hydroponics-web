import { createFileRoute } from '@tanstack/react-router'
import { GlobalReminderList } from '../../features/reminders/components/GlobalReminderList'

export const Route = createFileRoute('/_authenticated/reminders')({
  component: RemindersPage,
})

function RemindersPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Pengingat</h1>
        <p className="text-sm text-muted-foreground">Semua pengingat di seluruh farm Anda.</p>
      </div>
      <GlobalReminderList />
    </div>
  )
}
