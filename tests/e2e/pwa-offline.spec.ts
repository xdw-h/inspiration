import { expect, test } from '@playwright/test'

test('installs its service worker and reopens offline', async ({ page, context }) => {
  await page.goto('/')
  await page.evaluate(() => navigator.serviceWorker.ready)
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: '灵感' })).toBeVisible()
})
