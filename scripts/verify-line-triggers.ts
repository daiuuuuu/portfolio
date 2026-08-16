import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  const probe = `(async () => {
    // philosophy column is a tall data-reveal: heading + zh/en paragraphs + meta
    const card = document.querySelector('[data-section="philosophy"] [data-reveal]')
    const line = card.querySelector('p > div')   // first line of first paragraph
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    const op = () => getComputedStyle(line).opacity
    const VH = window.innerHeight
    const lineTop = () => line.getBoundingClientRect().top + window.scrollY
    const lineH = () => line.offsetHeight
    const cardVisible = () => {
      const r = card.getBoundingClientRect()
      return r.bottom > 0 && r.top < VH
    }

    // Step 1: enter normally, let the line settle visible
    window.scrollTo(0, lineTop() - VH * 0.7); await sleep(2500)
    const settled = op()

    // Step 2: scroll DOWN until the LINE is off the top edge — but card still visible
    window.scrollTo(0, lineTop() + lineH() - VH * 0.05)  // line bottom above 8% line
    await sleep(2500)
    const lineGoneCardVisible = { opacity: op(), cardVisible: cardVisible() }

    // Step 3: scroll BACK UP — the exact reported scenario
    window.scrollTo(0, lineTop() + lineH() - VH * 0.3)   // line re-enters from top
    await sleep(400)
    const upMid = op()
    await sleep(2500)
    const upDone = op()
    return { settled, lineGoneCardVisible, upMid, upDone }
  })()`
  console.log(JSON.stringify(await page.evaluate(probe), null, 1))

  // trigger count sanity
  const count = await page.evaluate(`document.querySelectorAll('[data-reveal] p > div, [data-reveal] h2 > div, [data-reveal] h3 > div, [data-reveal] h4 > div, [data-reveal] li > div').length`)
  console.log('line wrappers:', count)
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
