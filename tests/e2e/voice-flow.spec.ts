import { expect, test } from '@playwright/test'

test('records, previews and saves a voice idea', async ({ page, context }) => {
  await context.grantPermissions(['microphone'])
  await page.goto('/')
  await page.getByLabel('新增灵感').click()
  await page.getByRole('button', { name: '语音记录' }).click()
  await page.getByLabel('开始录音').click()
  await expect(page.getByText('正在录音')).toBeVisible()
  await page.waitForTimeout(1200)
  await page.getByRole('button', { name: '结束录音' }).click()
  await expect(page.locator('audio')).toBeVisible()
  await page.getByRole('button', { name: '保存' }).click()
  await expect(page.getByRole('heading', { name: '灵感详情' })).toBeVisible()
  await expect(page.locator('audio')).toBeVisible()
})
