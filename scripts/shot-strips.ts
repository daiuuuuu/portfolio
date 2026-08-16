import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  // scroll through cards slowly so reveals trigger, then capture card1 top and card2 top
  await page.evaluate(`document.querySelector('[data-project-index="1"]').scrollIntoView()`)
  await page.waitForTimeout(1500)
  await page.evaluate(`window.scrollBy(0, -120)`)
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'audit-shots/after/strip-card1.png' })
  await page.evaluate(`document.querySelector('[data-project-index="2"]').scrollIntoView()`)
  await page.waitForTimeout(1500)
  await page.evaluate(`window.scrollBy(0, -120)`)
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'audit-shots/after/strip-card2.png' })
  await browser.close()
  console.log('done')
}
main().catch(e => { console.error(e); process.exit(1) })
