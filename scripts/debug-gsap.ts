import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors: string[] = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message))
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const revealCount = await page.evaluate(() => document.querySelectorAll('[data-reveal]').length)
  const gsapLoaded = await page.evaluate(() => !!(window as any).gsap)
  console.log('data-reveal elements:', revealCount, '| window.gsap:', gsapLoaded)
  console.log('console errors:', errors.length ? errors.join('\n') : 'none')
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
