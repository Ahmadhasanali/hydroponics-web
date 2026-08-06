import { useEffect, useState } from 'react'
import { useFarms } from '../../farms/hooks/useFarms'
import { useTanks } from '../../tanks/hooks/useTanks'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import type { ReportParams } from '../types'

interface ReportFiltersProps {
  params: Partial<ReportParams>
  onChange: (params: Partial<ReportParams>) => void
}

const selectClass =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30'

export function ReportFilters({ params, onChange }: ReportFiltersProps) {
  const farmsQuery = useFarms()
  const farmId = params.farm_id
  const tanksQuery = useTanks(farmId ? Number(farmId) : 0)
  const [tankId, setTankId] = useState<string>(params.tank_id ?? '')

  const farms = farmsQuery.data ?? []
  const tanks = tanksQuery.data ?? []

  useEffect(() => {
    setTankId(params.tank_id ?? '')
  }, [params.tank_id])

  const handleFarmChange = (value: string) => {
    setTankId('')
    onChange({ ...params, farm_id: value, tank_id: '' })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <Label htmlFor="report_farm">Farm</Label>
        <select
          id="report_farm"
          className={selectClass}
          value={params.farm_id ?? ''}
          onChange={(e) => handleFarmChange(e.target.value)}
        >
          <option value="">Pilih farm</option>
          {farms.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="report_tank">Tank</Label>
        <select
          id="report_tank"
          className={selectClass}
          value={tankId}
          disabled={!farmId}
          onChange={(e) => {
            setTankId(e.target.value)
            onChange({ ...params, tank_id: e.target.value })
          }}
        >
          <option value="">{farmId ? 'Pilih tank' : 'Pilih farm dahulu'}</option>
          {tanks.map((tank) => (
            <option key={tank.id} value={tank.id}>
              {tank.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="report_start">Tanggal Mulai</Label>
        <Input
          id="report_start"
          type="date"
          value={params.start_date ?? ''}
          onChange={(e) => onChange({ ...params, start_date: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="report_end">Tanggal Akhir</Label>
        <Input
          id="report_end"
          type="date"
          value={params.end_date ?? ''}
          onChange={(e) => onChange({ ...params, end_date: e.target.value })}
        />
      </div>
    </div>
  )
}