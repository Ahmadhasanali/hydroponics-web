import { api } from '../../lib/api'
import type {
  Customer, Product, ReceivableItem, ReceivableSummary, Sale, SaleInput,
} from './types'

interface Ok<T> { success: boolean; data: T; message?: string }
interface Page<T> { success: boolean; data: T[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }

export async function fetchCustomers(farmId: number): Promise<Customer[]> {
  const res = await api.get<Ok<{ customers: Customer[] }>>('/customers', { params: { farm_id: farmId } })
  return res.data.customers
}
export async function createCustomer(input: { farm_id: number; name: string; phone?: string; address?: string }): Promise<Customer> {
  const res = await api.post<Ok<{ customer: Customer }>>('/customers', input)
  return res.data.customer
}
export async function fetchProducts(farmId: number): Promise<Product[]> {
  const res = await api.get<Ok<{ products: Product[] }>>('/products', { params: { farm_id: farmId } })
  return res.data.products
}
export async function createProduct(input: { farm_id: number; name: string; unit: 'kg' | 'pcs'; default_price: number }): Promise<Product> {
  const res = await api.post<Ok<{ product: Product }>>('/products', input)
  return res.data.product
}
export async function fetchSales(params: { farm_id: number; page?: number }): Promise<Page<Sale>> {
  return api.get<Page<Sale>>('/sales', { params: { farm_id: params.farm_id, page: params.page ?? 1 } })
}
export async function createSale(input: SaleInput): Promise<Sale> {
  const res = await api.post<Ok<{ sale: Sale }>>('/sales', input)
  return res.data.sale
}
export async function fetchReceivables(params: { farm_id: number; status?: string; page?: number }): Promise<Page<ReceivableItem>> {
  return api.get<Page<ReceivableItem>>('/sales/receivables', {
    params: { farm_id: params.farm_id, status: params.status || undefined, page: params.page ?? 1 },
  })
}
export async function fetchReceivableSummary(farmId: number): Promise<ReceivableSummary> {
  const res = await api.get<Ok<{ summary: ReceivableSummary }>>('/sales/receivables/summary', { params: { farm_id: farmId } })
  return res.data.summary
}
export async function createPayment(input: { sale_id: number; account_id: number; amount: number; payment_date: string; note?: string }): Promise<void> {
  const { sale_id, ...body } = input
  await api.post(`/sales/${sale_id}/payments`, body)
}
