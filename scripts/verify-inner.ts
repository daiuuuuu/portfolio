import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5173/portfolio/project/guji', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  // scroll down so OCR pane is in view
  await page.evaluate(`window.scrollTo(0, 2800)`)
  await page.waitForTimeout(500)
  const pane = page.locator('[style*="max-height: 32"]').first()
  const box = await pane.boundingBox()
  if (box) {
    const before = await pane.evaluate((el: any) => el.scrollTop)
    await page.mouse.move(box.x + box.width/2, box.y + box.height/2)
    await page.mouse.wheel(0, 200)
    await page.waitForTimeout(500)
    const after = await pane.evaluate((el: any) => el.scrollTop)
    console.log('OCR inner scroll:', after > before, `(${before} → ${after})`)
  } else {
    console.log('pane not found')
  }
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
