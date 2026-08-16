import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  const probe = `(async () => {
    const el = document.querySelector('[data-reveal-group="pain-points"]')
    const E = el.getBoundingClientRect().top + window.scrollY
    const H = el.offsetHeight
    const VH = window.innerHeight
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    const op = () => getComputedStyle(el).opacity
    const clip = () => getComputedStyle(el).clipPath

    // ── down-scroll entry: element rises from bottom edge ──
    window.scrollTo(0, E - VH - 50)   // element fully below viewport
    await sleep(300)
    const downBefore = op()
    window.scrollTo(0, E - VH * 0.85) // element top crosses 92% line
    await sleep(150)
    const downMid = op()
    const downMidClip = clip()
    await sleep(900)
    const downDone = op()

    // ── exit through top ──
    window.scrollTo(0, E + H + 100)   // element fully above viewport
    await sleep(900)
    const exitedUp = op()

    // ── up-scroll entry: element re-enters from TOP edge ──
    window.scrollTo(0, E + H - VH * 0.04) // element bottom just below 8% line
    await sleep(150)
    const upMid = op()
    await sleep(900)
    const upDone = op()

    // ── exit through bottom (scrolling up past it) ──
    window.scrollTo(0, E - VH - 50)
    await sleep(900)
    const exitedDown = op()

    return { downBefore, downMid, downMidClip, downDone, exitedUp, upMid, upDone, exitedDown }
  })()`
  console.log(JSON.stringify(await page.evaluate(probe), null, 1))

  // visual: capture mid-wipe
  await page.evaluate(`(async () => {
    const el = document.querySelector('[data-reveal-group="pain-points"]')
    const E = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, E - window.innerHeight * 0.85)
  })()`)
  await page.waitForTimeout(200)
  await page.screenshot({ path: 'audit-shots/after/wipe-mid.png' })
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
