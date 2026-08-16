import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/project/guji', { waitUntil: 'load' })
  await page.waitForTimeout(2000)

  const r = await page.evaluate(`(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    const VH = window.innerHeight
    // guji scan image is TALL (古籍扫描页)
    const img = document.querySelector('[data-section="guji-showcase"] img')
    const H = document.documentElement.scrollHeight
    for (let y = 0; y <= H; y += 400) { window.scrollTo(0, y); await sleep(100) }
    await sleep(1000)
    const imgH = img.getBoundingClientRect().height
    const LT = () => img.getBoundingClientRect().top + window.scrollY

    // image top at 15% viewport — OLD behavior would already be fading here
    window.scrollTo(0, LT() - VH * 0.15); await sleep(900)
    const topAt15 = { op: getComputedStyle(img).opacity, bottomPct: Math.round(img.getBoundingClientRect().bottom / VH * 100) }

    // image bottom at 15% — NOW it should start fading
    window.scrollTo(0, LT() + imgH - VH * 0.15); await sleep(900)
    const bottomAt15 = { op: getComputedStyle(img).opacity }

    // image bottom at 7% — fully faded
    window.scrollTo(0, LT() + imgH - VH * 0.07); await sleep(900)
    const bottomAt7 = { op: getComputedStyle(img).opacity }

    // text line still behaves: park a line top in fade band
    const line = document.querySelector('[data-reveal-group="pain-points"] p > div')
    const LL = () => line.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, LL() - VH * 0.11); await sleep(900)
    const lineFade = { op: getComputedStyle(line).opacity }

    return { imgH: Math.round(imgH), topAt15, bottomAt15, bottomAt7, lineFade }
  })()`)
  console.log(JSON.stringify(r, null, 1))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
