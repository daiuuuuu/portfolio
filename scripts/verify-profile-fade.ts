import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5173/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  const r = await page.evaluate(`(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    // find first about paragraph line
    const line = document.querySelector('#profile [data-reveal] p > div')
    if (!line) return { error: 'no line found' }
    const VH = window.innerHeight
    const LT = () => line.getBoundingClientRect().top + window.scrollY

    // enter reading zone
    window.scrollTo(0, LT() - VH * 0.5); await sleep(2000)
    const lit = getComputedStyle(line).opacity

    // scroll so line exits at top (line bottom near 15% → fade band)
    window.scrollTo(0, LT() - VH * 0.12); await sleep(1000)
    const fading = getComputedStyle(line).opacity

    // scroll back: fade should restore
    window.scrollTo(0, LT() - VH * 0.5); await sleep(1000)
    const restored = getComputedStyle(line).opacity

    return { lit: Number(lit).toFixed(2), fading: Number(fading).toFixed(2), restored: Number(restored).toFixed(2) }
  })()`)
  console.log(JSON.stringify(r, null, 1))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
