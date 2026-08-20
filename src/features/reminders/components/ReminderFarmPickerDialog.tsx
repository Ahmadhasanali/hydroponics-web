import { Warehouse } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { useFarms } from '../../farms/hooks/useFarms'

export function ReminderFarmPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (farmId: number) => void
}) {
  const { data: farms } = useFarms()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bottom-0 top-auto left-1/2 -translate-x-1/2 translate-y-0 rounded-b-none sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-b-xl"
      >
        <DialogHeader>
          <DialogTitle>Pilih Farm</DialogTitle>
          <DialogDescription>Pilih farm untuk pengingat baru.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {(farms ?? []).map((farm) => (
            <button
              key={farm.id}
              type="button"
              onClick={() => onSelect(farm.id)}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-secondary/10"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                <Warehouse className="size-5" />
              </span>
              <span className="text-sm font-semibold text-foreground">{farm.name}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
