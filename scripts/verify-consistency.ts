import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()

  // 1. Hero intro replays on project→project navigation (the bug fix)
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  // navigate via Next Project link
  await page.evaluate(`window.scrollTo(0, document.body.scrollHeight)`)
  await page.waitForTimeout(800)
  await page.click('[data-animate="project-next-link"]')
  await page.waitForTimeout(500)  // mid-intro of the new hero
  const midIntro = await page.evaluate(`(() => {
    const t = document.querySelector('[data-animate="project-hero-title"]')
    const s = getComputedStyle(t)
    return { url: location.pathname, opacity: s.opacity, transform: s.transform.slice(0, 40) }
  })()`)
  console.log('hero intro after project→project nav:', JSON.stringify(midIntro))

  // 2. Gallery image now has opacity journey
  await page.waitForTimeout(2000)
  const galleryCheck = await page.evaluate(`(async () => {
    const img = document.querySelector('[data-reveal-group="gallery"] img')
    if (!img) return 'no gallery'
    const VH = window.innerHeight
    const LT = () => img.getBoundingClientRect().top + window.scrollY
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    window.scrollTo(0, LT() - VH - 50); await sleep(500)
    const below = getComputedStyle(img).opacity
    window.scrollTo(0, LT() - VH * 0.5); await sleep(800)
    const lit = getComputedStyle(img).opacity
    return { below, lit }
  })()`)
  console.log('gallery img journey:', JSON.stringify(galleryCheck))

  // 3. Guji scan image journey
  await page.goto('http://localhost:5174/portfolio/project/guji', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  const gujiCheck = await page.evaluate(`(async () => {
    const img = document.querySelector('[data-section="guji-showcase"] img')
    const VH = window.innerHeight
    const LT = () => img.getBoundingClientRect().top + window.scrollY
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    window.scrollTo(0, LT() - VH - 50); await sleep(500)
    const below = getComputedStyle(img).opacity
    window.scrollTo(0, LT() - VH * 0.5); await sleep(800)
    const lit = getComputedStyle(img).opacity
    return { below, lit }
  })()`)
  console.log('guji scan journey:', JSON.stringify(gujiCheck))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
