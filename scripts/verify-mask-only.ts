import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const probe = `(async () => {
    const el = document.querySelector('[data-reveal-group="pain-points"]')
    const E = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, E - window.innerHeight * 0.85)
    await new Promise(r => setTimeout(r, 400))
    const line = el.querySelector('p > div')
    const s = getComputedStyle(line)
    return { opacity: s.opacity, clip: s.clipPath, transform: s.transform }
  })()`
  console.log(JSON.stringify(await page.evaluate(probe), null, 1))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
