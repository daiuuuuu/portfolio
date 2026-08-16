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

    // enter & settle
    window.scrollTo(0, LT() - VH * 0.5); await sleep(2000)

    // exit at top: start fade, sample mid-fade
    window.scrollTo(0, LT() - VH * 0.10); await sleep(700)
    const midFade = op()                       // should be ~0.5-0.7

    // REVERSE direction mid-fade — the reported scenario
    window.scrollTo(0, LT() - VH * 0.30)
    const samples = []
    for (let i = 0; i < 5; i++) { await sleep(150); samples.push(op()) }

    await sleep(1500)
    const recovered = op()

    // flip again mid-recovery → should head back down smoothly
    window.scrollTo(0, LT() - VH * 0.10)
    const samples2 = []
    for (let i = 0; i < 3; i++) { await sleep(150); samples2.push(op()) }

    return { midFade, recoverySamples: samples, recovered, refadeSamples: samples2 }
  })()`
  const r = await page.evaluate(probe)
  console.log(JSON.stringify(r, null, 1))
  // monotonicity check: recovery samples must be non-decreasing (no snap to 1, no drop)
  const s = (r as any).recoverySamples
  const monoUp = s.every((v: number, i: number) => i === 0 || v >= s[i - 1] - 0.02)
  const noSnap = s[0] < 0.95  // first sample must NOT have jumped to ~1
  console.log('recovery monotonic:', monoUp, '| no snap-to-1:', noSnap)
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
