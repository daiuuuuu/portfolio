import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.mouse.move(720, 450)

  // single gentle notch
  let b = await page.evaluate('window.scrollY') as number
  await page.mouse.wheel(0, 100)
  await page.waitForTimeout(1800)
  let s = await page.evaluate('window.scrollY') as number
  console.log('single notch total:', Math.round(s - b), 'px (50 direct + small coast)')

  // fast flick: 6 notches rapid
  b = await page.evaluate('window.scrollY') as number
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 100); await page.waitForTimeout(25) }
  await page.waitForTimeout(200)
  const afterDirect = await page.evaluate('window.scrollY') as number
  await page.waitForTimeout(1500)
  s = await page.evaluate('window.scrollY') as number
  console.log('flick: direct ≈', Math.round(afterDirect - b), '· total:', Math.round(s - b), '· coast:', Math.round(s - afterDirect), 'px (cap 300)')

  // reverse flick: inertia must go UP, not accumulate downward
  b = await page.evaluate('window.scrollY') as number
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, -100); await page.waitForTimeout(25) }
  await page.waitForTimeout(1800)
  s = await page.evaluate('window.scrollY') as number
  console.log('reverse flick total:', Math.round(s - b), 'px (negative = coasted upward)')
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
