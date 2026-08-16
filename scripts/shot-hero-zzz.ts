import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5173/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: 'audit-shots/after/hero-zzz.png' })
  // scroll slightly to show stripe movement
  await page.evaluate(`window.scrollTo(0, 300)`)
  await page.waitForTimeout(1200)
  await page.screenshot({ path: 'audit-shots/after/hero-zzz-scrolled.png' })
  await browser.close()
  console.log('done')
}
main().catch(e => { console.error(e); process.exit(1) })
