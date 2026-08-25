import { useFarms } from '../../farms/hooks/useFarms'

interface FarmPickerProps {
  value: number | ''
  onChange: (farmId: number | '') => void
}

export function FarmPicker({ value, onChange }: FarmPickerProps) {
  const { data: farms = [] } = useFarms()

  return (
    <select
      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
    >
      <option value="">Pilih farm</option>
      {farms.map((farm) => (
        <option key={farm.id} value={farm.id}>
          {farm.name}
        </option>
      ))}
    </select>
  )
}
