import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/reminders')({
  component: () => <p className="text-sm text-muted-foreground">Halaman pengingat (dalam pengembangan).</p>,
})
