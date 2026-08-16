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
    const state = () => ({ op: parseFloat(getComputedStyle(line).opacity).toFixed(2), clip: getComputedStyle(line).clipPath })
    const VH = window.innerHeight
    const LT = () => line.getBoundingClientRect().top + window.scrollY

    // A. down entrance from bottom: wipe mid-play
    window.scrollTo(0, LT() - VH * 0.85); await sleep(400)
    const downEnter = state()
    await sleep(1600)

    // B. down exit at top: fade out
    window.scrollTo(0, LT() - VH * 0.10); await sleep(300)
    const downExitMid = state()
    await sleep(600)
    const downExitDone = state()

    // C. up entrance from top: wipe replays (clip animating again, opacity already 1)
    window.scrollTo(0, LT() - VH * 0.30); await sleep(400)
    const upEnter = state()
    await sleep(1600)
    const upEnterDone = state()

    // D. up exit at bottom: fade out
    window.scrollTo(0, LT() - VH + 60); await sleep(300)
    const upExitMid = state()
    await sleep(600)
    const upExitDone = state()

    // E. down again: wipe replays
    window.scrollTo(0, LT() - VH * 0.85); await sleep(400)
    const replay = state()

    return { downEnter, downExitMid, downExitDone, upEnter, upEnterDone, upExitMid, upExitDone, replay }
  })()`
  console.log(JSON.stringify(await page.evaluate(probe), null, 1))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
