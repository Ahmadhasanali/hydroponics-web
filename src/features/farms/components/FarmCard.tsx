import { Link } from '@tanstack/react-router'
import type { Farm } from '../../../lib/types'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from '../../../components/ui/card'

export function FarmCard({ farm }: { farm: Farm }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{farm.name}</CardTitle>
        {farm.location && <CardDescription>{farm.location}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {farm.tanks_count ?? 0} tank{farm.tanks_count === 1 ? '' : 's'}
        </p>
      </CardContent>
      <CardFooter>
        <Link to="/farms/$farmId" params={{ farmId: String(farm.id) }} className="text-sm font-medium text-[#d4a020] hover:text-[#8a6d00]">
          Detail
        </Link>
      </CardFooter>
    </Card>
  )
}