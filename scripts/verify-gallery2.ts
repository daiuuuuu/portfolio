import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  // direct load of a gallery-heavy page, wait for full load event
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'load' })
  await page.waitForTimeout(2500)
  const r = await page.evaluate(`(async () => {
    const img = document.querySelector('[data-reveal-group="gallery"] img')
    const VH = window.innerHeight
    const LT = () => img.getBoundingClientRect().top + window.scrollY
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    window.scrollTo(0, LT() - VH - 50); await sleep(500)
    const below = getComputedStyle(img).opacity
    window.scrollTo(0, LT() - VH * 0.5); await sleep(800)
    const lit = getComputedStyle(img).opacity
    // park in top fade band
    window.scrollTo(0, LT() - VH * 0.10); await sleep(600)
    const frozen = getComputedStyle(img).opacity
    return { below, lit, frozen }
  })()`)
  console.log('image-workflow gallery img:', JSON.stringify(r))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
