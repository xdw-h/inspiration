import { expect, test } from '@playwright/test'

test('shows the latest version announcement once', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('dialog', { name: '版本公告' })).toBeVisible()
  await expect(page.getByText('v0.2.0')).toBeVisible()
  await page.getByLabel('关闭版本公告').click()
  await page.reload()
  await expect(page.getByRole('dialog', { name: '版本公告' })).toBeHidden()
})
