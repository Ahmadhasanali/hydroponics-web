import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  component: () => <div>Dashboard (to be implemented)</div>,
})