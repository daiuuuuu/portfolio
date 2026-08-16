import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  const probe = `(async () => {
    const section = document.querySelector('[data-section="project-next"]')
    const reveal = section.querySelector('[data-reveal]')
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    const VH = window.innerHeight
    // what's inside: text blocks and line wrappers?
    const blocks = reveal.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li').length
    const lines = reveal.querySelectorAll('p > div, h3 > div').length
    const firstLine = reveal.querySelector('h3 > div, p > div')
    const info = {
      blocks, lines,
      firstLineClip: firstLine ? getComputedStyle(firstLine).clipPath : null,
      firstLineOp: firstLine ? getComputedStyle(firstLine).opacity : null,
    }

    // scroll so the section enters from bottom
    const LT = () => firstLine.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, LT() - VH * 0.85); await sleep(400)
    const enter = { clip: getComputedStyle(firstLine).clipPath, op: getComputedStyle(firstLine).opacity }
    await sleep(1600)
    const settled = { clip: getComputedStyle(firstLine).clipPath, op: getComputedStyle(firstLine).opacity }

    // scroll DOWN past it (exit at top)
    window.scrollTo(0, LT() - VH * 0.10); await sleep(2200)
    const exited = { clip: getComputedStyle(firstLine).clipPath, op: getComputedStyle(firstLine).opacity }

    // scroll back UP — expect wipe replay
    window.scrollTo(0, LT() - VH * 0.35); await sleep(500)
    const reEnter = { clip: getComputedStyle(firstLine).clipPath, op: getComputedStyle(firstLine).opacity }

    return { info, enter, settled, exited, reEnter }
  })()`
  console.log(JSON.stringify(await page.evaluate(probe), null, 1))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
