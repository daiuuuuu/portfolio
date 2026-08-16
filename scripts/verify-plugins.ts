import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  // 1. smoothWheel: Observer should be active, scrolling works
  await page.goto('http://localhost:5173/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  // rapid wheel flick should move the page
  const s1 = await page.evaluate('window.scrollY') as number
  await page.mouse.wheel(0, 100)
  await page.waitForTimeout(400)
  const s2 = await page.evaluate('window.scrollY') as number
  console.log('wheel moves page:', Math.abs(s2 - s1) > 5, `(${Math.round(s1)} → ${Math.round(s2)})`)

  // 2. InertiaPlugin: after rapid scroll, inertia should continue beyond direct target
  const before = await page.evaluate('window.scrollY') as number
  for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 100); await page.waitForTimeout(20) }
  await page.waitForTimeout(200) // direct glides settling
  const afterGlide = await page.evaluate('window.scrollY') as number
  await page.waitForTimeout(1200) // inertia coast completes
  const afterInertia = await page.evaluate('window.scrollY') as number
  console.log('direct:', Math.round(afterGlide - before), '· inertia:', Math.round(afterInertia - before), '· coast:', Math.round(afterInertia - afterGlide), '(> 0 = inertia works)')

  // 3. inner scroller still works (OCR pane on guji)
  await page.goto('http://localhost:5173/portfolio/project/guji', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const pane = page.locator('.overflow-y-auto.scrollbar-hide').first()
  const box = await pane.boundingBox()
  if (box) {
    await page.mouse.move(box.x + box.width/2, box.y + box.height/2)
    await page.mouse.wheel(0, 200)
    await page.waitForTimeout(500)
    const innerTop = await pane.evaluate(el => el.scrollTop)
    console.log('OCR inner scroll survives:', innerTop > 0, `(${innerTop}px)`)
  }

  // 4. ScrambleText: SectionLabel should have animate
  await page.goto('http://localhost:5173/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const hasScramble = await page.evaluate(`document.querySelectorAll('[data-section="project-philosophy"] span').length > 0`)
  console.log('SectionLabel rendered:', hasScramble)
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
