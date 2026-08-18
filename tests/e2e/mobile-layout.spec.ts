import { expect, test } from '@playwright/test'
import { dismissReleaseNotes } from './helpers'

for (const width of [375, 390, 430]) {
  test(`${width}px has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    await dismissReleaseNotes(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.getByLabel('新增灵感').click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
