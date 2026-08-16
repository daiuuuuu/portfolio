import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const probe = `(async () => {
    const el = document.querySelector('[data-reveal-group="pain-points"]')
    const E = el.getBoundingClientRect().top + window.scrollY
    const H = el.offsetHeight
    const VH = window.innerHeight
    const sEnd = E + H - 0.08 * VH
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    const line = el.querySelector('p > div')   // SplitText line wrapper
    const op = () => getComputedStyle(line).opacity
    window.scrollTo(0, E - VH - 50); await sleep(800)
    const before = op()
    window.scrollTo(0, E - VH * 0.85); await sleep(2500)
    const settled = op()
    window.scrollTo(0, sEnd + 200); await sleep(2500)
    const exitedUp = op()
    window.scrollTo(0, sEnd - 180); await sleep(500)
    const upMid = op()
    await sleep(2500)
    const upDone = op()
    return { before, settled, exitedUp, upMid, upDone }
  })()`
  console.log(JSON.stringify(await page.evaluate(probe), null, 1))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
