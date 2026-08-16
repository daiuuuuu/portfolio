import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'load' })
  await page.waitForTimeout(2000)
  // simulate real user: smooth-scroll down in steps so lazy images load naturally
  const r = await page.evaluate(`(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    const img = document.querySelector('[data-reveal-group="gallery"] img')
    const VH = window.innerHeight
    // scroll through the whole page in 400px steps, letting lazy media load
    const H = document.documentElement.scrollHeight
    for (let y = 0; y <= H; y += 400) { window.scrollTo(0, y); await sleep(120) }
    await sleep(1200)
    const LT = () => img.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, LT() - VH - 60); await sleep(700)
    const below = getComputedStyle(img).opacity
    window.scrollTo(0, Math.min(LT() - VH * 0.5, document.documentElement.scrollHeight - VH)); await sleep(900)
    const lit = getComputedStyle(img).opacity
    return { below, lit, rectTop: Math.round(img.getBoundingClientRect().top) }
  })()`)
  console.log(JSON.stringify(r, null, 1))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
