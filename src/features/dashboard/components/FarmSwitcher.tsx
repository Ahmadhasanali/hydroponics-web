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
  const activeFarm = farms.find((f) => f.id === selectedFarmId) ?? farms[0]

  if (farms.length < 2) {
    return activeFarm ? (
      <span className="rounded-2xl bg-muted px-3 py-2 text-sm font-semibold text-foreground">
        {activeFarm.name}
      </span>
    ) : null
  }

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