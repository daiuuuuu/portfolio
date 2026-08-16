import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5173/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: 'audit-shots/after/hero-slanted.png' })
  await browser.close()
  console.log('done')
}
main().catch(e => { console.error(e); process.exit(1) })
