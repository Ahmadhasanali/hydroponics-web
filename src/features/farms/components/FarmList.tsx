import { useState } from 'react'
import type { Farm } from '../../../lib/types'
import { useFarms, useDeleteFarm } from '../hooks/useFarms'
import { FarmCard } from './FarmCard'
import { FarmForm } from './FarmForm'
import { Button } from '../../../components/ui/button'

export function FarmList() {
  const { data: farms, isLoading, isError } = useFarms()
  const deleteFarm = useDeleteFarm()
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Farm | undefined>(undefined)

  const handleEdit = (farm: Farm) => {
    setEditing(farm)
    setCreateOpen(true)
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat daftar farm...</p>
  if (isError) return <p className="text-sm text-red-600">Gagal memuat daftar farm.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Farms</h1>
        <Button onClick={() => { setEditing(undefined); setCreateOpen(true) }}>Create Farm</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {farms?.map((farm) => (
          <div key={farm.id} className="relative">
            <FarmCard farm={farm} />
            <div className="absolute top-3 right-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(farm)}>
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (window.confirm(`Hapus farm "${farm.name}"?`)) deleteFarm.mutate(farm.id)
                }}
                disabled={deleteFarm.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {!farms?.length && <p className="text-sm text-muted-foreground">Belum ada farm.</p>}

      <FarmForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        farm={editing}
      />
    </div>
  )
}