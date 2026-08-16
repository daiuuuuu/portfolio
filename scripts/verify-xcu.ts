import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/project/xcu', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  // Pin active? strip translated? measure at three scroll positions
  const measure = `(() => {
    const strip = document.querySelector('[data-animate="horizontal-scroll-strip"]')
    const pinned = !!document.querySelector('.pin-spacer')
    return { pinned, x: strip ? new DOMMatrixReadOnly(getComputedStyle(strip).transform).m41 : null }
  })()`
  const section = await page.evaluate(`document.querySelector('[data-section="xcu-showcase"]').getBoundingClientRect().top + window.scrollY`)
  console.log('section top:', Math.round(section as number))

  await page.evaluate(`window.scrollTo(0, ${Math.round((section as number) + 10)})`)
  await page.waitForTimeout(800)
  console.log('at pin start:', JSON.stringify(await page.evaluate(measure)))
  await page.screenshot({ path: 'audit-shots/after/xcu-pin-start.png' })

  await page.evaluate(`window.scrollTo(0, ${Math.round((section as number) + 1200)})`)
  await page.waitForTimeout(1200)
  console.log('mid pin:', JSON.stringify(await page.evaluate(measure)))
  await page.screenshot({ path: 'audit-shots/after/xcu-pin-mid.png' })

  // reverse: strip must travel back
  await page.evaluate(`window.scrollTo(0, ${Math.round((section as number) + 10)})`)
  await page.waitForTimeout(1200)
  console.log('reversed:', JSON.stringify(await page.evaluate(measure)))

  // mobile: pin must NOT engage
  const mp = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await mp.goto('http://localhost:5174/portfolio/project/xcu', { waitUntil: 'networkidle' })
  await mp.waitForTimeout(1000)
  await mp.evaluate(`document.querySelector('[data-section="xcu-showcase"]').scrollIntoView()`)
  await mp.waitForTimeout(600)
  console.log('mobile pinned:', JSON.stringify(await mp.evaluate(`!!document.querySelector('.pin-spacer')`)))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
