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
    const sEnd = E + H - 0.08 * VH   // scrollY where element bottom hits 8% line
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    const op = () => getComputedStyle(el).opacity

    // ── exit through top (scroll down past element) ──
    window.scrollTo(0, E - VH * 0.85); await sleep(1000)   // enter & settle (opacity 1)
    const settled = op()
    window.scrollTo(0, sEnd + 200)                          // fully past end → onLeave reverse
    await sleep(1000)
    const exitedUp = op()

    // ── up-scroll entry: come from above, re-enter from TOP edge ──
    window.scrollTo(0, sEnd - 180)                          // bottom at 252px from top → inside active zone → onEnterBack play
    await sleep(150)
    const upMid = op()
    await sleep(1000)
    const upDone = op()

    // ── exit through bottom (scroll further up) ──
    window.scrollTo(0, E - VH - 50)
    await sleep(1000)
    const exitedDown = op()

    return { settled, exitedUp, upMid, upDone, exitedDown }
  })()`
  console.log(JSON.stringify(await page.evaluate(probe), null, 1))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
