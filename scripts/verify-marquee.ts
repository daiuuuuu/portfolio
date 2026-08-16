import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  // detail page: two strips, opposite directions, scroll-linked
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1800)

  const r = await page.evaluate(`(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    const strips = Array.from(document.querySelectorAll('article > div[class*="overflow-hidden"][data-reveal]'))
      .map(el => ({ el, track: el.firstElementChild }))
      .filter(s => s.track && s.track.classList.contains('w-max'))
    const x = t => new DOMMatrixReadOnly(getComputedStyle(t).transform).m41

    const [overview, decisions] = strips
    const before = { y: window.scrollY, a: x(overview.track), b: x(decisions.track) }

    // scroll down 600px → both move, opposite signs
    window.scrollTo(0, 600); await sleep(600)
    const down = { a: x(overview.track), b: x(decisions.track) }

    // STOP — positions must freeze (scroll-linked)
    const frozenA1 = x(overview.track); await sleep(800); const frozenA2 = x(overview.track)

    // scroll back up 300 → both retrace
    window.scrollTo(0, 300); await sleep(600)
    const up = { a: x(overview.track), b: x(decisions.track) }

    return {
      stripCount: strips.length,
      before, down, frozen: [frozenA1, frozenA2], up,
      overviewText: overview.el.textContent.slice(0, 90),
      decisionsText: decisions.el.textContent.slice(0, 90),
    }
  })()`)
  console.log(JSON.stringify(r, null, 1))

  // home: index strip present
  await page.goto('http://localhost:5174/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const home = await page.evaluate(`(() => {
    const strip = document.querySelector('[data-project-index="1"] .w-max')
    return strip ? strip.textContent.slice(0, 110) : 'MISSING'
  })()`)
  console.log('home strip:', home)
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
