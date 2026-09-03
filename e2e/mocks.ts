import type { Page } from '@playwright/test'

export type TelegramState = {
  linked: boolean
  externalId?: string
  linkedAt?: string
  defaultFarmId?: number | null
  code?: string
  sales?: unknown[]
  receivables?: unknown[]
  summary?: object
}

const farm = { id: 1, name: 'Kebun A', created_by: 1 }
const tank = {
  id: 1,
  farm_id: 1,
  name: 'Tank 1',
  capacity_liter: 100,
  is_active: true,
  created_by: 1,
}

const ok = (data: unknown) => ({ success: true, data, message: '' })

export function seedAuth(page: Page) {
  return page.addInitScript(() => {
    localStorage.setItem('auth_token', 'test-token')
  })
}

/**
 * Mock semua endpoint API Laravel (baseURL http://localhost/api/v1)
 * yang disentuh app di mobile viewport. State telegram bisa diubah
 * dari test via object yang sama.
 */
export async function mockApi(page: Page, state: TelegramState) {
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname.replace(/\/api\/v1/, '')
    const method = route.request().method()

    const json = (data: unknown, status = 200) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(data),
      })

    // Auth
    if (path === '/user') return json(ok({ user: { id: 1, name: 'Ali', email: 'ali@test.com', is_admin: false } }))

    // Telegram
    if (path === '/telegram/status') {
      return json(
        ok({
          linked: state.linked,
          external_id: state.externalId ?? null,
          linked_at: state.linkedAt ?? null,
          default_farm_id: state.defaultFarmId ?? null,
        }),
      )
    }
    if (path === '/telegram/link-code' && method === 'POST') {
      state.code = state.code ?? 'ABC123'
      state.linked = false
      return json(ok({ code: state.code, expires_at: new Date(Date.now() + 60_000).toISOString() }))
    }
    if (path === '/telegram/default-farm' && method === 'PATCH') {
      state.defaultFarmId = route.request().postDataJSON()?.farm_id ?? null
      return json(ok({ default_farm_id: state.defaultFarmId }))
    }
    if (path === '/telegram/unlink' && method === 'POST') {
      state.linked = false
      state.externalId = undefined
      state.linkedAt = undefined
      state.defaultFarmId = null
      return json(ok(null))
    }

    // Farms & dashboard (halaman / memuat keduanya)
    if (path === '/farms') return json(ok({ farms: [farm] }))
    if (path === '/dashboard') {
      return json(
        ok({
          farms: [farm],
          selectedFarm: farm,
          tanks: [tank],
          stats: { total_tanks: 1, active_tanks: 1, avg_ppm: 800, avg_ph: 6.2, avg_temp: 26 },
          activityLogs: [],
        }),
      )
    }

    // Chat widget (AppLayout) + reminders summary di dashboard
    if (path === '/chat/sessions') return json(ok({ sessions: [] }))
    if (path === '/reminders') return json(ok({ reminders: [] }))

    // FinanceWidget di dashboard
    if (path === '/financial-transactions/summary') {
      return json(
        ok({
          summary: { income: 2_000_000, expense: 1_200_000, net: 800_000, series: [], categories: [] },
        }),
      )
    }

    // Sales
    if (path === '/sales/receivables') {
      return json({ success: true, data: state.receivables ?? [], meta: { current_page: 1, last_page: 1, per_page: 20, total: (state.receivables ?? []).length }, message: '' })
    }
    if (path === '/sales/receivables/summary') {
      return json(ok({ summary: state.summary ?? { total_remaining: 63000, customer_count: 1, overdue_count: 0 } }))
    }
    if (path === '/sales' && method === 'POST') {
      const body = route.request().postDataJSON()
      state.receivables = [{
        id: 9,
        customer: { id: 1, name: 'Warung Bu Siti' },
        due_date: body.due_date,
        total_amount: body.items.reduce((t: number, i: { qty: number; price: number }) => t + i.qty * i.price, 0),
        paid_amount: 0,
        remaining_amount: body.items.reduce((t: number, i: { qty: number; price: number }) => t + i.qty * i.price, 0),
        status: 'unpaid',
        overdue: false,
      }]
      return json(ok({ sale: { id: 9, status: 'unpaid' } }))
    }
    if (path === '/sales/9/payments' && method === 'POST') {
      state.receivables = []
      state.summary = { total_remaining: 0, customer_count: 0, overdue_count: 0 }
      return json(ok({ payment: { id: 1 } }))
    }
    // Customers, products, accounts (dipakai form penjualan)
    if (path === '/customers') return json(ok({ customers: [{ id: 1, name: 'Warung Bu Siti', is_active: true }] }))
    if (path === '/products') return json(ok({ products: [{ id: 1, name: 'Selada', unit: 'kg', default_price: '21000.00', is_active: true }] }))
    if (path === '/accounts') return json(ok({ accounts: [{ id: 1, name: 'Cash', type: 'cash', is_default: true, is_active: true, balance: 100000 }, { id: 2, name: 'Dana', type: 'ewallet', is_default: false, is_active: true, balance: 0 }] }))

    // Fallback: biar test tidak fail diam-diam saat ada endpoint lain
    return json(ok(null))
  })
}
