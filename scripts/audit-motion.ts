import { chromium } from 'playwright'

const ROUTES = [
  ['home', ''],
  ['duanfu', 'project/duanfu'],
  ['xcu', 'project/xcu'],
  ['guji', 'project/guji'],
  ['video-factory', 'project/video-factory'],
  ['image-workflow', 'project/image-workflow'],
  ['portfolio-site', 'project/portfolio-site'],
]

async function main() {
  const browser = await chromium.launch()
  for (const [name, path] of ROUTES) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    await page.goto(`http://localhost:5174/portfolio/${path}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    const stats = await page.evaluate(`(() => {
      const reveals = Array.from(document.querySelectorAll('[data-reveal]'))
      const covers = reveals.filter(el => el.dataset.reveal === 'cover')
      const textEls = reveals.filter(el => el.dataset.reveal !== 'cover')
      let lines = 0, fallbacks = 0, unanimated = []
      textEls.forEach(el => {
        const lineDivs = el.querySelectorAll(':scope p > div, :scope h1 > div, :scope h2 > div, :scope h3 > div, :scope h4 > div, :scope li > div')
        const hasOwnClip = el.style.clipPath && el.style.clipPath !== 'none'
        if (lineDivs.length > 0) lines += lineDivs.length
        else if (hasOwnClip || el.querySelectorAll('p,h1,h2,h3,h4,h5,h6,li').length === 0) fallbacks++
        else unanimated.push(el.dataset.revealGroup || el.className.slice(0, 40))
      })
      return {
        reveals: reveals.length, covers: covers.length, textEls: textEls.length,
        splitLines: lines, fallbacks, unanimated,
        groups: new Set(reveals.map(el => el.dataset.revealGroup).filter(Boolean)).size,
      }
    })()`)
    console.log(name.padEnd(16), JSON.stringify(stats), errors.length ? 'ERRORS: ' + errors.join('; ') : '')
    await page.close()
  }
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
