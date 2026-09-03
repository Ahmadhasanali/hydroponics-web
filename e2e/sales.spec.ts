import { test, expect, type Page } from '@playwright/test'
import { mockApi, seedAuth, type TelegramState } from './mocks'

let state: TelegramState

test.beforeEach(async ({ page }) => {
  state = { linked: false, receivables: [] }
  await seedAuth(page)
  await mockApi(page, state)
})

async function openSales(page: Page) {
  await page.goto('/sales')
  await expect(page.getByRole('heading', { name: 'Penjualan' })).toBeVisible()
}

test('jual kredit → piutang muncul → bayar → kosong', async ({ page }) => {
  await openSales(page)

  await page.getByRole('button', { name: '+ Penjualan' }).click()
  // pelanggan — dialog select (farm picker outside dialog, so first in dialog is pelanggan)
  await page.getByRole('dialog').locator('select').first().selectOption('1')
  await page.getByRole('button', { name: 'Kredit (hutang)' }).click()
  // Input date pertama di mode kredit = jatuh tempo (Label tidak menautkan htmlFor)
  await page.locator('input[type="date"]').first().fill('2026-09-08')
  // pilih produk — second select in dialog
  await page.getByRole('dialog').locator('select').nth(1).selectOption('1')
  await page.getByPlaceholder('Qty').fill('3')
  await page.getByPlaceholder('Harga').fill('21000')
  await page.getByRole('button', { name: 'Simpan Penjualan' }).click()

  await expect(page.locator('p').filter({ hasText: 'Warung Bu Siti' }).first()).toBeVisible()
  await expect(page.getByText(/63\.000/).first()).toBeVisible()

  await page.getByRole('button', { name: 'Catat pembayaran' }).click()
  await page.getByRole('dialog').locator('select').selectOption('2') // Dana
  await page.getByRole('button', { name: 'Simpan Pembayaran' }).click()

  await expect(page.getByText('Total piutang')).toBeVisible()
  await expect(page.getByText(/Rp\s*0/).first()).toBeVisible()
})
