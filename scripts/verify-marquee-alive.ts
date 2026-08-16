import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5173/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  // marquee should move with scroll
  const m = await page.evaluate(`(async () => {
    const track = document.querySelector('[data-reveal] .w-max')
    const x = t => new DOMMatrixReadOnly(getComputedStyle(t).transform).m41
    const b = x(track)
    window.scrollTo(0, 500); await new Promise(r => setTimeout(r, 1000))
    return { before: Math.round(b), after: Math.round(x(track)), moved: Math.abs(x(track) - b) > 5 }
  })()`)
  console.log('marquee alive:', JSON.stringify(m))

  // now simulate resize → marquee should STILL work after rebuild
  await page.setViewportSize({ width: 1200, height: 900 })
  await page.waitForTimeout(600)
  const afterResize = await page.evaluate(`(async () => {
    const track = document.querySelector('[data-reveal] .w-max')
    window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 300))
    const b = new DOMMatrixReadOnly(getComputedStyle(track).transform).m41
    window.scrollTo(0, 500); await new Promise(r => setTimeout(r, 1000))
    return { before: Math.round(b), after: Math.round(new DOMMatrixReadOnly(getComputedStyle(track).transform).m41) }
  })()`)
  console.log('marquee after resize:', JSON.stringify(afterResize))

  // verify text reveals still work (rebuild kept them)
  const reveal = await page.evaluate(`(async () => {
    const card = document.querySelector('[data-section="philosophy"] [data-reveal]')
    const line = card.querySelector('p > div')
    const VH = window.innerHeight
    const LT = () => line.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, LT() - VH * 0.85)
    await new Promise(r => setTimeout(r, 500))
    return getComputedStyle(line).clipPath
  })()`)
  console.log('reveal survives:', reveal !== 'inset(0% 100% 0% 0%)' && reveal !== 'none')

  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
