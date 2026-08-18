import type { Page } from '@playwright/test'

export async function dismissReleaseNotes(page: Page) {
  const close = page.getByLabel('关闭版本公告')
  if (await close.isVisible()) await close.click()
}
