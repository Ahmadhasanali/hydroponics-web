import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { FarmPicker } from '../../features/finance/components/FarmPicker'
import { SaleFormDialog } from '../../features/sales/components/SaleFormDialog'
import { SaleList } from '../../features/sales/components/SaleList'
import { ReceivablesTab } from '../../features/sales/components/ReceivablesTab'
import { CustomerProductManager } from '../../features/sales/components/CustomerProductManager'
import { useFarms } from '../../features/farms/hooks/useFarms'
import { useAutoSelectSingle } from '../../hooks/useAutoSelectSingle'

export const Route = createFileRoute('/_authenticated/sales')({
  component: SalesPage,
})

function SalesPage() {
  const [farmId, setFarmId] = useState<number | ''>('')
  const [open, setOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const { data: farms } = useFarms()
  useAutoSelectSingle(farms, farmId, (farm) => setFarmId(farm.id))

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Penjualan</h1>
          <p className="text-sm text-muted-foreground">Catat penjualan dan pantau piutang warung/toko.</p>
        </div>
        <Button variant="outline" disabled={farmId === ''} onClick={() => setManageOpen(true)}>Kelola</Button>
      </div>

      <div className="max-w-xs">
        <FarmPicker value={farmId} onChange={setFarmId} />
      </div>

      {farmId === '' ? (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Pilih farm untuk melihat penjualan.</CardContent></Card>
      ) : (
        <Tabs defaultValue="piutang">
          <TabsList>
            <TabsTrigger value="piutang">Piutang</TabsTrigger>
            <TabsTrigger value="penjualan">Riwayat Penjualan</TabsTrigger>
          </TabsList>

          <TabsContent value="piutang" className="space-y-3 pt-4">
            <div className="flex justify-end">
              <Button onClick={() => setOpen(true)}>+ Penjualan</Button>
            </div>
            <ReceivablesTab farmId={Number(farmId)} />
          </TabsContent>

          <TabsContent value="penjualan" className="space-y-3 pt-4">
            <div className="flex justify-end">
              <Button onClick={() => setOpen(true)}>+ Penjualan</Button>
            </div>
            <SaleList farmId={Number(farmId)} />
          </TabsContent>
        </Tabs>
      )}

      {farmId !== '' ? (
        <>
          <SaleFormDialog open={open} onClose={() => setOpen(false)} farmId={Number(farmId)} />
          <CustomerProductManager open={manageOpen} onClose={() => setManageOpen(false)} farmId={Number(farmId)} />
        </>
      ) : null}
    </div>
  )
}
