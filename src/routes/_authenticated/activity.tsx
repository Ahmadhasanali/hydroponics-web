import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useFarms } from '../../features/farms/hooks/useFarms'
import { FarmSwitcher } from '../../features/dashboard/components/FarmSwitcher'
import { ActivityLogList } from '../../features/activity/components/ActivityLogList'

export const Route = createFileRoute('/_authenticated/activity')({
  component: ActivityPage,
})

function ActivityPage() {
  const { data: farms } = useFarms()
  const [farmId, setFarmId] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (farmId === undefined && farms?.length) {
      setFarmId(farms[0].id)
    }
  }, [farms, farmId])

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Aktivitas</h1>
          <p className="text-sm text-muted-foreground">Riwayat aktivitas di kebun Anda.</p>
        </div>
        <FarmSwitcher
          farms={farms ?? []}
          selectedFarmId={farmId}
          onSelect={(id) => setFarmId(id)}
        />
      </div>

      {farmId !== undefined ? (
        <ActivityLogList key={farmId} farmId={farmId} />
      ) : (
        <p className="text-sm text-muted-foreground">Pilih farm untuk melihat aktivitas.</p>
      )}
    </div>
  )
}
