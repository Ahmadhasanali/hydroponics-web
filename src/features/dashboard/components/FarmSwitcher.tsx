import { Button } from '../../../components/ui/button'
import type { Farm } from '../../../lib/types'

export function FarmSwitcher({
  farms,
  selectedFarmId,
  onSelect,
}: {
  farms: Farm[]
  selectedFarmId?: number
  onSelect: (id: number) => void
}) {
  if (farms.length < 2) return null

  return (
    <div className="flex flex-wrap items-center gap-2" data-slot="button-group">
      {farms.map((farm) => {
        const active = farm.id === selectedFarmId
        return (
          <Button
            key={farm.id}
            variant={active ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(farm.id)}
          >
            {farm.name}
          </Button>
        )
      })}
    </div>
  )
}