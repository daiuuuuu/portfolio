import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'load' })
  await page.waitForTimeout(2500)
  const r = await page.evaluate(`(async () => {
    const img = document.querySelector('[data-reveal-group="gallery"] img')
    const VH = window.innerHeight
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    window.scrollTo(0, img.getBoundingClientRect().top + window.scrollY - VH * 0.5)
    await sleep(900)
    // find ScrollTriggers on this element via gsap
    const triggers = (window.__st = [])
    // ScrollTrigger isn't global; inspect via element's _gsap
    const info = {
      rectTop: Math.round(img.getBoundingClientRect().top),
      expectedProgress: ((1.0 - 0.5) / 0.93).toFixed(3),
      inlineOpacity: img.style.opacity,
      gsapOpacity: img._gsap ? img._gsap.opacity : null,
      scrollY: Math.round(window.scrollY),
      docHeight: document.documentElement.scrollHeight,
      maxScroll: document.documentElement.scrollHeight - VH,
    }
    return info
  })()`)
  console.log(JSON.stringify(r, null, 1))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
