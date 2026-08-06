import { createFileRoute } from '@tanstack/react-router'
import { FarmList } from '../../../features/farms/components/FarmList'

export const Route = createFileRoute('/_authenticated/farms/')({
  component: FarmList,
})