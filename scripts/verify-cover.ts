import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  const probe = `(async () => {
    const cover = document.querySelector('[data-reveal="cover"]')
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    const op = () => parseFloat(getComputedStyle(cover).opacity)
    const clip = () => getComputedStyle(cover).clipPath
    const VH = window.innerHeight
    const LT = () => cover.getBoundingClientRect().top + window.scrollY

    // below viewport → should be invisible (opacity 0)
    window.scrollTo(0, LT() - VH - 50); await sleep(600)
    const below = { op: op(), clip: clip() }

    // entering: at 95% → mid fade-in
    window.scrollTo(0, LT() - VH * 0.95); await sleep(600)
    const entering = op()

    // fully in reading zone
    window.scrollTo(0, LT() - VH * 0.5); await sleep(600)
    const lit = { op: op(), clip: clip() }

    // parked in top fade band at 10%, scroll stopped
    window.scrollTo(0, LT() - VH * 0.10); await sleep(600)
    const frozen1 = op()
    await sleep(1500)
    const frozen2 = op()

    return { below, entering, lit, frozen1, frozen2 }
  })()`
  console.log(JSON.stringify(await page.evaluate(probe), null, 1))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
