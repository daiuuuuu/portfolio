import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const y = await page.evaluate(`(document.querySelector('[data-reveal-group="pain-points"]').getBoundingClientRect().top + window.scrollY) - 880`)
  await page.evaluate(`window.scrollTo(0, ${Math.round('$' + '{y}') || 0})`)
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'audit-shots/after/gsap-mid-reveal.png' })
  await browser.close()
  console.log('done')
}
main().catch(e => { console.error(e); process.exit(1) })
