import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.evaluate(`(() => {
    const strips = Array.from(document.querySelectorAll('.w-max'))
    strips[0].parentElement.scrollIntoView({ block: 'center' })
  })()`)
  await page.waitForTimeout(1200)
  await page.screenshot({ path: 'audit-shots/after/marquee-detail.png' })
  await page.goto('http://localhost:5174/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.evaluate(`document.querySelector('[data-project-index="1"]').scrollIntoView()`)
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'audit-shots/after/marquee-home.png' })
  await browser.close()
  console.log('done')
}
main().catch(e => { console.error(e); process.exit(1) })
