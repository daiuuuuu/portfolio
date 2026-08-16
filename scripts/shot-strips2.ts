import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.evaluate(`document.querySelector('[data-project-index="1"]').scrollIntoView()`)
  await page.waitForTimeout(1500)
  await page.evaluate(`window.scrollBy(0, -60)`)
  await page.waitForTimeout(600)

  // seam check: at wrap point, no blank — sample track text continuity
  const seam = await page.evaluate(`(() => {
    const track = document.querySelector('[data-project-index="1"] .w-max')
    const spans = track.children
    const end = spans[0].textContent.slice(-30)
    const start = spans[1].textContent.slice(0, 30)
    return { halfEnd: end, halfStart: start, identical: spans[0].textContent === spans[1].textContent }
  })()`)
  console.log(JSON.stringify(seam, null, 1))
  await page.screenshot({ path: 'audit-shots/after/strip-en.png' })
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
