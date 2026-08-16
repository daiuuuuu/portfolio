import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  // 1. wheel works + inertia coast
  await page.goto('http://localhost:5173/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const s1 = await page.evaluate('window.scrollY') as number
  await page.mouse.wheel(0, 100)
  await page.waitForTimeout(600)
  const s2 = await page.evaluate('window.scrollY') as number
  console.log('1. wheel moves:', Math.abs(s2 - s1) > 5, `(${s1} → ${s2})`)

  // 2. rapid flick + inertia
  const b = await page.evaluate('window.scrollY') as number
  for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 100); await page.waitForTimeout(15) }
  await page.waitForTimeout(250)
  const mid = await page.evaluate('window.scrollY') as number
  await page.waitForTimeout(1000)
  const end = await page.evaluate('window.scrollY') as number
  console.log(`2. flick: direct=${Math.round(mid-b)}  coast=${Math.round(end-mid)}  total=${Math.round(end-b)}`)

  // 3. inner OCR scroller passthrough
  await page.goto('http://localhost:5173/portfolio/project/guji', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  const pane = page.locator('[style*="max-height"]').first()
  const box = await pane.boundingBox()
  if (box) {
    await page.mouse.move(box.x + box.width/2, box.y + box.height/2)
    await page.mouse.wheel(0, 200)
    await page.waitForTimeout(600)
    const innerTop = await pane.evaluate((el: any) => el.scrollTop)
    console.log('3. inner scroller:', innerTop > 0, `(${innerTop}px)`)
  }

  // 4. marquee scrub (fromTo) — still alive
  await page.goto('http://localhost:5173/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const mx = await page.evaluate(`((async () => {
    const trk = document.querySelector('[data-reveal="marquee"] .w-max')
    const a = new DOMMatrixReadOnly(getComputedStyle(trk).transform).m41
    window.scrollTo(0, 500); await new Promise(r => setTimeout(r, 800))
    const b = new DOMMatrixReadOnly(getComputedStyle(trk).transform).m41
    return {before:Math.round(a), after:Math.round(b), moved: Math.abs(b-a) > 5}
  })())`)
  console.log('4. marquee moves:', JSON.stringify(mx))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
