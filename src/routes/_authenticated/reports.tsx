import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ReportFilters } from '../../features/reports/components/ReportFilters'
import { MonitoringReport } from '../../features/reports/components/MonitoringReport'
import { NutrientReport } from '../../features/reports/components/NutrientReport'
import { PhDownReport } from '../../features/reports/components/PhDownReport'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs'
import type { ReportParams } from '../../features/reports/types'

export const Route = createFileRoute('/_authenticated/reports')({
  component: ReportsPage,
})

function ReportsPage() {
  const [params, setParams] = useState<Partial<ReportParams>>({
    farm_id: '',
    tank_id: '',
    start_date: '',
    end_date: '',
  })

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Laporan</h1>
        <p className="text-sm text-muted-foreground">Lihat rekap monitoring, nutrisi, dan pH Down.</p>
      </div>

      <ReportFilters params={params} onChange={setParams} />

      <Tabs defaultValue="monitoring">
        <TabsList>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="nutrient">Nutrisi</TabsTrigger>
          <TabsTrigger value="ph-down">pH Down</TabsTrigger>
        </TabsList>
        <TabsContent value="monitoring" className="pt-4">
          <MonitoringReport params={params} />
        </TabsContent>
        <TabsContent value="nutrient" className="pt-4">
          <NutrientReport params={params} />
        </TabsContent>
        <TabsContent value="ph-down" className="pt-4">
          <PhDownReport params={params} />
        </TabsContent>
      </Tabs>
    </div>
  )
}