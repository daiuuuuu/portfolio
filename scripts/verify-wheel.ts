import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  // one wheel notch (deltaY=100): native would jump 100px instantly
  await page.mouse.move(720, 450)
  await page.mouse.wheel(0, 100)
  await page.waitForTimeout(80)
  const early = await page.evaluate('window.scrollY')
  await page.waitForTimeout(800)
  const settled = await page.evaluate('window.scrollY')
  console.log('one notch (100): early(80ms)=', Math.round(early as number), ' settled=', Math.round(settled as number))

  // five quick notches: accumulation + retargeting, no runaway
  await page.mouse.wheel(0, 100); await page.mouse.wheel(0, 100); await page.mouse.wheel(0, 100)
  await page.mouse.wheel(0, 100); await page.mouse.wheel(0, 100)
  await page.waitForTimeout(900)
  const after5 = await page.evaluate('window.scrollY')
  console.log('after 5 notches from', Math.round(settled as number), '→', Math.round(after5 as number), '(expect +250)')

  // inner scroller passthrough: OCR text pane on guji page
  await page.goto('http://localhost:5174/portfolio/project/guji', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  const pane = page.locator('.overflow-y-auto.scrollbar-hide').first()
  await pane.scrollIntoViewIfNeeded()
  const box = await pane.boundingBox()
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.wheel(0, 200)
    await page.waitForTimeout(400)
    const inner = await pane.evaluate(el => el.scrollTop)
    console.log('inner OCR pane scrollTop after wheel:', inner, '(>0 = native passthrough works)')
  }
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
