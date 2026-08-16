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
    const clip = () => getComputedStyle(line).clipPath
    const VH = window.innerHeight
    const LT = () => line.getBoundingClientRect().top + window.scrollY

    // 1. bottom entrance still wipes in
    window.scrollTo(0, LT() - VH * 0.85); await sleep(2200)
    const entered = { op: op(), clip: clip() }

    // 2. scroll down: line top crosses the 18%→7% band → progressive fade
    window.scrollTo(0, LT() - VH * 0.12); await sleep(900)   // line top at 12% → mid fade
    const midFade = op()
    window.scrollTo(0, LT() - VH * 0.05); await sleep(900)   // line top at 5% → fully faded
    const faded = op()

    // 3. scroll back up: fades back in
    window.scrollTo(0, LT() - VH * 0.12); await sleep(900)
    const fadeBack = op()
    window.scrollTo(0, LT() - VH * 0.5); await sleep(900)
    const restored = op()

    return { entered, midFade, faded, fadeBack, restored }
  })()`
  console.log(JSON.stringify(await page.evaluate(probe), null, 1))

  // visual frame: mid fade at top of screen
  await page.evaluate(`(async () => {
    const card = document.querySelector('[data-section="philosophy"] [data-reveal]')
    const line = card.querySelector('p > div')
    window.scrollTo(0, line.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.12)
  })()`)
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'audit-shots/after/top-fade-mid.png' })
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
