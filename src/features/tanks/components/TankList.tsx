import { useState } from 'react'
import type { Tank } from '../../../lib/types'
import { useTanks, useDeleteTank } from '../hooks/useTanks'
import { TankCard } from './TankCard'
import { TankForm } from './TankForm'
import { Button } from '../../../components/ui/button'

export function TankList({ farmId }: { farmId: number }) {
  const { data: tanks, isLoading, isError } = useTanks(farmId)
  const deleteTank = useDeleteTank()
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Tank | undefined>(undefined)

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat daftar tank...</p>
  if (isError) return <p className="text-sm text-red-600">Gagal memuat daftar tank.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Tank</h1>
        <Button
          onClick={() => {
            setEditing(undefined)
            setCreateOpen(true)
          }}
        >
          Buat Tank
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tanks?.map((tank) => (
          <div key={tank.id} className="relative">
            <TankCard farmId={farmId} tank={tank} />
            <div className="absolute top-3 right-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditing(tank); setCreateOpen(true) }}>
                Ubah
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (window.confirm(`Hapus tank "${tank.name}"?`)) deleteTank.mutate(tank.id)
                }}
                disabled={deleteTank.isPending}
              >
                Hapus
              </Button>
            </div>
          </div>
        ))}
      </div>

      {!tanks?.length && <p className="text-sm text-muted-foreground">Belum ada tank.</p>}

      <TankForm open={createOpen} onOpenChange={setCreateOpen} farmId={farmId} tank={editing} />
    </div>
  )
}