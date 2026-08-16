import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  const probe = `(async () => {
    const card = document.querySelector('[data-section="philosophy"] [data-reveal]')
    const line = card.querySelector('p > div')
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    const op = () => parseFloat(getComputedStyle(line).opacity)
    const VH = window.innerHeight
    const LT = () => line.getBoundingClientRect().top + window.scrollY

    // settle in reading zone
    window.scrollTo(0, LT() - VH * 0.5); await sleep(1200)
    const lit = op()

    // scroll down so line top sits at 10% — INSIDE the 15%→7% fade band — then STOP
    window.scrollTo(0, LT() - VH * 0.10); await sleep(800)
    const frozen1 = op()
    await sleep(1500)   // wait longer than the old 1.65s time-based fade
    const frozen2 = op()   // must equal frozen1 — fade frozen with scroll stopped

    // continue scrolling down → fade continues
    window.scrollTo(0, LT() - VH * 0.075); await sleep(600)
    const fadedMore = op()

    // scroll back up → fade reverses with position
    window.scrollTo(0, LT() - VH * 0.10); await sleep(600)
    const backToSameSpot = op()

    return { lit, frozen1, frozen2, fadedMore, backToSameSpot }
  })()`
  const r = await page.evaluate(probe)
  console.log(JSON.stringify(r, null, 1))
  const froze = Math.abs((r as any).frozen1 - (r as any).frozen2) < 0.02
  console.log('frozen when scroll stops:', froze)
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
