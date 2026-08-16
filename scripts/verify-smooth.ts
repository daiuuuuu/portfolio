import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5173/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  // rapid continuous wheeling — measure monotonicity
  const samples: number[] = []
  await page.mouse.move(720, 450)
  for (let i = 0; i < 20; i++) {
    await page.mouse.wheel(0, 100)
    await page.waitForTimeout(16)
    const y = await page.evaluate('window.scrollY') as number
    samples.push(Math.round(y))
  }
  // check monotonic (should always increase since we only scroll down)
  const monotonic = samples.every((v, i) => i === 0 || v >= samples[i-1])
  const first = samples[0], last = samples[samples.length-1]
  console.log('rapid scroll: monotonic =', monotonic, `(0 → ${first} → ${last}, total ${last-first}px)`)
  console.log('samples:', samples.join(' → '))

  // inertia: let it coast
  const before = last
  await page.waitForTimeout(1500)
  const after = await page.evaluate('window.scrollY') as number
  console.log('inertia coast:', Math.round(after - before), 'px extra')

  // inner scroller still works
  await page.goto('http://localhost:5173/portfolio/project/guji', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.evaluate(`window.scrollTo(0, 2800)`)
  await page.waitForTimeout(500)
  const pane = page.locator('[style*="max-height: 32"]').first()
  const box = await pane.boundingBox()
  if (box) {
    await page.mouse.move(box.x+box.width/2, box.y+box.height/2)
    await page.mouse.wheel(0, 200)
    await page.waitForTimeout(500)
    const scroll = await pane.evaluate((el: any) => el.scrollTop)
    console.log('inner scroller:', scroll > 0, `(${scroll}px)`)
  }
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
