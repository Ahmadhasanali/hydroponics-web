import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/farms/$farmId/tanks/$tankId')({
  component: () => <Outlet />,
})
