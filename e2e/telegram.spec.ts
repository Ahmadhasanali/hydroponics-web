import { test, expect, type Page } from '@playwright/test'
import { mockApi, seedAuth, type TelegramState } from './mocks'

let state: TelegramState

test.beforeEach(async ({ page }) => {
  state = { linked: false }
  await seedAuth(page)
  await mockApi(page, state)
})

async function goToTelegramSettings(page: Page) {
  await page.goto('/')
  await expect(page.getByRole('main').getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await page.getByRole('link', { name: 'Telegram' }).click()
  await expect(page.getByRole('main').getByRole('heading', { name: 'Telegram' })).toBeVisible()
}

test('belum terhubung: generate kode 6-char + countdown muncul', async ({ page }) => {
  await goToTelegramSettings(page)

  await page.getByRole('button', { name: 'Generate Kode' }).click()
  await expect(page.getByText('ABC123')).toBeVisible()
  await expect(page.getByText(/Kadaluarsa 60s/)).toBeVisible()

  // Countdown berjalan turun
  await expect(page.getByText(/Kadaluarsa (59|58|57)s/)).toBeVisible({ timeout: 5_000 })
})

test('generate ulang: kode baru + countdown reset ke 60s', async ({ page }) => {
  await goToTelegramSettings(page)
  await page.getByRole('button', { name: 'Generate Kode' }).click()
  await expect(page.getByText('ABC123')).toBeVisible()

  state.code = 'XYZ789'
  await page.getByRole('button', { name: 'Generate Kode' }).click()
  await expect(page.getByText('XYZ789')).toBeVisible()
  await expect(page.getByText(/Kadaluarsa 60s/)).toBeVisible()
})

test('sudah terhubung: tampil chat_id, picker default farm, dan tombol putuskan', async ({ page }) => {
  state.linked = true
  state.externalId = '777888999'
  state.linkedAt = '2026-09-03'
  state.defaultFarmId = null

  await goToTelegramSettings(page)

  await expect(page.getByText(/Chat ID: 777888999/)).toBeVisible()
  await expect(page.getByText(/Sejak 2026-09-03/)).toBeVisible()

  const select = page.locator('select')
  await expect(select).toBeVisible()
  await expect(select.locator('option')).toHaveCount(2)

  await page.getByRole('button', { name: 'Putuskan' }).click()
  await expect(page.getByRole('button', { name: 'Generate Kode' })).toBeVisible()
})

test('pilih default farm langsung PATCH /telegram/default-farm', async ({ page }) => {
  state.linked = true
  state.externalId = '777888999'
  state.linkedAt = '2026-09-03'

  await goToTelegramSettings(page)

  await page.locator('select').selectOption('1')
  await expect.poll(() => state.defaultFarmId).toBe(1)
})

test('route telegram tanpa token auth → redirect login', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('main').getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  // Hapus token di setiap navigasi berikutnya (init script jalan setelah seedAuth)
  await page.addInitScript(() => localStorage.removeItem('auth_token'))
  await page.goto('/settings/telegram')
  await expect(page).toHaveURL(/\/login/)
})
