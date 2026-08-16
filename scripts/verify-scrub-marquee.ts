import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5173/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  const m = await page.evaluate(`(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    const x = t => new DOMMatrixReadOnly(getComputedStyle(t).transform).m41
    const t1 = document.querySelector('[data-project-index="1"] .w-max')
    const t2 = document.querySelector('[data-project-index="2"] .w-max')

    // card 1: left dir → should go negative on scroll down
    const a1 = x(t1), a2 = x(t2)
    window.scrollTo(0, 500); await sleep(800)
    const b1 = x(t1), b2 = x(t2)

    // card 2: right dir → should go positive on scroll down (from negative toward 0)
    return {
      card1: { before: Math.round(a1), after: Math.round(b1), delta: Math.round(b1 - a1), leftDir: b1 < a1 },
      card2: { before: Math.round(a2), after: Math.round(b2), delta: Math.round(b2 - a2), rightDir: b2 > a2 },
    }
  })()`)
  console.log(JSON.stringify(m, null, 1))

  // scroll back up — marquee should reverse
  const r = await page.evaluate(`(async () => {
    const x = t => new DOMMatrixReadOnly(getComputedStyle(t).transform).m41
    const t1 = document.querySelector('[data-project-index="1"] .w-max')
    const a = x(t1)
    window.scrollTo(0, 0)
    await new Promise(r => setTimeout(r, 800))
    return { before: Math.round(a), after: Math.round(x(t1)), reversed: x(t1) > a }
  })()`)
  console.log('reverse:', JSON.stringify(r))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
