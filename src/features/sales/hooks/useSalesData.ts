import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCustomer, createPayment, createProduct, createSale, fetchCustomers, fetchProducts, fetchReceivables, fetchReceivableSummary, fetchSales } from '../api'
import type { SaleInput } from '../types'

const keys = {
  customers: (farmId: number) => ['sales', 'customers', farmId] as const,
  products: (farmId: number) => ['sales', 'products', farmId] as const,
  sales: (farmId: number) => ['sales', 'list', farmId] as const,
  receivables: (farmId: number, status: string) => ['sales', 'receivables', farmId, status] as const,
  summary: (farmId: number) => ['sales', 'summary', farmId] as const,
}

export function useCustomers(farmId: number | '') {
  return useQuery({
    queryKey: keys.customers(Number(farmId)),
    queryFn: () => fetchCustomers(Number(farmId)),
    enabled: farmId !== '' && Number.isFinite(farmId),
  })
}
export function useProducts(farmId: number | '') {
  return useQuery({
    queryKey: keys.products(Number(farmId)),
    queryFn: () => fetchProducts(Number(farmId)),
    enabled: farmId !== '' && Number.isFinite(farmId),
  })
}
export function useSales(farmId: number | '') {
  return useQuery({
    queryKey: keys.sales(Number(farmId)),
    queryFn: () => fetchSales({ farm_id: Number(farmId) }),
    enabled: farmId !== '' && Number.isFinite(farmId),
  })
}
export function useReceivables(farmId: number | '', status: string = '') {
  return useQuery({
    queryKey: keys.receivables(Number(farmId), status),
    queryFn: () => fetchReceivables({ farm_id: Number(farmId), status }),
    enabled: farmId !== '' && Number.isFinite(farmId),
  })
}
export function useReceivableSummary(farmId: number | '') {
  return useQuery({
    queryKey: keys.summary(Number(farmId)),
    queryFn: () => fetchReceivableSummary(Number(farmId)),
    enabled: farmId !== '' && Number.isFinite(farmId),
  })
}

function useInvalidateSales() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: ['sales'] })
}

export function useCreateSale() {
  const invalidate = useInvalidateSales()
  return useMutation({ mutationFn: (input: SaleInput) => createSale(input), onSuccess: invalidate })
}
export function useCreatePayment() {
  const invalidate = useInvalidateSales()
  return useMutation({ mutationFn: createPayment, onSuccess: invalidate })
}
export function useCreateCustomer() {
  const invalidate = useInvalidateSales()
  return useMutation({ mutationFn: createCustomer, onSuccess: invalidate })
}

export function useCreateProduct() {
  const invalidate = useInvalidateSales()
  return useMutation({ mutationFn: createProduct, onSuccess: invalidate })
}
