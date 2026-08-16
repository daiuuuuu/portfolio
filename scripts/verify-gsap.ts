import { chromium } from 'playwright'

const PROBE = `(async () => {
  const el = document.querySelector('[data-reveal-group="pain-points"]')
  if (!el) return 'missing'
  const read = async () => { await new Promise(r => setTimeout(r, 800)); return getComputedStyle(el).opacity }
  window.scrollTo(0, 0); const before = await read()
  el.scrollIntoView({ block: 'center' }); const inView = await read()
  window.scrollTo(0, 0); const scrolledBack = await read()
  el.scrollIntoView({ block: 'center' }); const reEntered = await read()
  return { before, inView, scrolledBack, reEntered }
})()`

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  console.log('bidirectional probe:', JSON.stringify(await page.evaluate(PROBE)))

  await page.goto('http://localhost:5174/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const home = await page.evaluate(`({
    total: document.querySelectorAll('[data-reveal]').length,
    marked: Array.from(document.querySelectorAll('[data-reveal]')).filter(el => el.style.opacity !== '' || el.style.transform !== '').length,
  })`)
  console.log('home:', JSON.stringify(home))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
