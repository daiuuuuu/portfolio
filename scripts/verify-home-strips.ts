import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const strips = await page.evaluate(`(() => {
    const x = t => new DOMMatrixReadOnly(getComputedStyle(t).transform).m41
    return Array.from(document.querySelectorAll('[data-project-index]')).map(card => {
      const wrap = card.querySelector('.absolute.top-0 > div')
      const track = card.querySelector('.w-max')
      return {
        card: card.dataset.projectIndex,
        widthPct: Math.round(wrap.getBoundingClientRect().width / window.innerWidth * 100),
        alignRight: wrap.classList.contains('ml-auto'),
        bg: getComputedStyle(card.querySelector('[data-reveal]')).backgroundColor,
        text: track.textContent.slice(0, 60),
      }
    })
  })()`)
  console.log(JSON.stringify(strips, null, 1))

  // direction check: card1 vs card2 x-movement on same scroll
  const dirs = await page.evaluate(`(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    const x = t => new DOMMatrixReadOnly(getComputedStyle(t).transform).m41
    const t1 = document.querySelector('[data-project-index="1"] .w-max')
    const t2 = document.querySelector('[data-project-index="2"] .w-max')
    window.scrollTo(0, 0); await sleep(300)
    const a1 = x(t1), a2 = x(t2)
    window.scrollTo(0, 500); await sleep(600)
    return { card1: Math.round(x(t1) - a1), card2: Math.round(x(t2) - a2) }
  })()`)
  console.log('movement on +500px scroll:', JSON.stringify(dirs))

  await page.screenshot({ path: 'audit-shots/after/home-strips-full.png', fullPage: true })
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
