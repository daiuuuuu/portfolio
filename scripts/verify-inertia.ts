import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.mouse.move(720, 450)

  // simulate a fast flick: 5 notches in quick succession, then stop
  const before = await page.evaluate('window.scrollY') as number
  for (let i = 0; i < 5; i++) { await page.mouse.wheel(0, 100); await page.waitForTimeout(30) }
  await page.waitForTimeout(400)   // direct glide done, inertia not yet/just firing
  const afterDirect = await page.evaluate('window.scrollY') as number
  await page.waitForTimeout(1200)  // inertia glide completes
  const settled = await page.evaluate('window.scrollY') as number

  console.log('before:', Math.round(before))
  console.log('after direct glides:', Math.round(afterDirect), '(5 notches × 50 = +250 expected)')
  console.log('after inertia:', Math.round(settled))
  console.log('inertia coast distance:', Math.round(settled - afterDirect), 'px (>0 = momentum works)')

  // gentle single notch: velocity low → little/no inertia, no overshoot
  const b2 = await page.evaluate('window.scrollY') as number
  await page.mouse.wheel(0, 100)
  await page.waitForTimeout(1500)
  const s2 = await page.evaluate('window.scrollY') as number
  console.log('single gentle notch:', Math.round(s2 - b2), 'px (≈50 + small coast)')
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
