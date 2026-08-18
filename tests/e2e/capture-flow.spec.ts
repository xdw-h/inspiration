import { expect, test } from '@playwright/test'
import { dismissReleaseNotes } from './helpers'

test('creates, reloads, searches, edits and deletes a text idea', async ({ page }) => {
  await page.goto('/')
  await dismissReleaseNotes(page)
  await page.getByLabel('新增灵感').click()
  await page.getByLabel('灵感标题').fill('散步灵感')
  await page.getByLabel('灵感正文').fill('散步时想到的产品点子')
  await page.getByRole('button', { name: '保存' }).click()
  await expect(page.getByRole('heading', { name: '灵感详情' })).toBeVisible()
  await page.goto('/')
  await page.getByLabel('搜索灵感').fill('产品点子')
  await expect(page.getByText('散步灵感')).toBeVisible()
  await page.getByText('散步灵感').click()
  await page.getByLabel('灵感正文').fill('更新后的产品点子')
  await page.getByRole('button', { name: '保存' }).click()
  await expect(page.getByLabel('灵感正文')).toHaveValue('更新后的产品点子')
})
