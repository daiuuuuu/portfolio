import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/', { waitUntil: 'networkidle' })
  await page.hover('a[href="#projects"]')
  await page.waitForTimeout(300)
  const nav = await page.locator('nav').boundingBox()
  await page.screenshot({ path: 'audit-shots/after/hover-nav.png', clip: { x: 0, y: 0, width: 1440, height: 64 } })
  await page.close()
  await browser.close()
  console.log('done')
}
main().catch(e => { console.error(e); process.exit(1) })
