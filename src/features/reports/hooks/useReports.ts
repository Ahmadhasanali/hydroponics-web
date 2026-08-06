import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import type { ApiResponse } from '../../../lib/types'
import type {
  MonitoringAggregates,
  NutrientAggregates,
  PhDownAggregates,
  ReportParams,
} from '../types'
import type { ReportType } from '../types'

export function isReportComplete(params: Partial<ReportParams>): params is ReportParams {
  return Boolean(params.farm_id && params.tank_id && params.start_date && params.end_date)
}

function useReport<T extends object>(
  type: ReportType,
  params: Partial<ReportParams>,
) {
  return useQuery({
    queryKey: ['reports', type, params],
    queryFn: () =>
      api
        .get<ApiResponse<{ aggregates: T | null }>>(`/reports/${type}`, { params })
        .then((r) => r.data.aggregates),
    enabled: isReportComplete(params),
  })
}

export function useMonitoringReport(params: Partial<ReportParams>) {
  return useReport<MonitoringAggregates>('monitoring', params)
}

export function useNutrientReport(params: Partial<ReportParams>) {
  return useReport<NutrientAggregates>('nutrient', params)
}

export function usePhReport(params: Partial<ReportParams>) {
  return useReport<PhDownAggregates>('ph-down', params)
}