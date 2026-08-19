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
        {farm.address && <CardDescription>{farm.address}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {farm.tanks_count ?? 0} tank
        </p>
      </CardContent>
      <CardFooter>
        <Link to="/farms/$farmId" params={{ farmId: String(farm.id) }} className="text-sm font-medium text-secondary hover:text-foreground">
          Detail
        </Link>
      </CardFooter>
    </Card>
  )
}