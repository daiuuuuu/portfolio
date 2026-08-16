import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  // scroll first project card into center, hover its cover
  await page.evaluate(`document.querySelector('[data-project-index="1"]').scrollIntoView({block:'center'})`)
  await page.waitForTimeout(900)
  const cover = await page.locator('[data-project-index="1"] img[data-reveal="cover"]').boundingBox()
  if (!cover) throw new Error('cover not found')
  await page.mouse.move(cover.x + cover.width / 2, cover.y + cover.height / 2)
  await page.waitForTimeout(900)
  await page.screenshot({ path: 'audit-shots/after/invert-hover.png' })

  // leave → reversed
  await page.mouse.move(60, 450)
  await page.waitForTimeout(900)
  const clip = await page.evaluate(`document.querySelector('[data-project-index="1"] [aria-hidden="true"]').style.clipPath`)
  await page.screenshot({ path: 'audit-shots/after/invert-leave.png' })
  console.log('clip after leave:', clip)
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
