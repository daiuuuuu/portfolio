import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  // 1. SplitText produced line wrappers?
  const lineCount = await page.evaluate(`document.querySelectorAll('[data-reveal] [class]').length && (() => {
    let n = 0
    document.querySelectorAll('[data-reveal]').forEach(el => {
      el.querySelectorAll('div').forEach(d => { if (d.style.clipPath || d.style.transform) n++ })
    })
    return n
  })()`)
  console.log('animated line wrappers found:', lineCount)

  // 2. Enter mid-animation: capture two frames showing progressive line reveal
  await page.evaluate(`(async () => {
    const el = document.querySelector('[data-reveal-group="pain-points"]')
    const E = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, E - window.innerHeight * 0.85)
  })()`)
  await page.waitForTimeout(350)
  await page.screenshot({ path: 'audit-shots/after/lines-frame1.png' })
  await page.waitForTimeout(600)
  await page.screenshot({ path: 'audit-shots/after/lines-frame2.png' })

  // 3. Bidirectional still correct with the new timelines
  const probe = `(async () => {
    const el = document.querySelector('[data-reveal-group="pain-points"]')
    const E = el.getBoundingClientRect().top + window.scrollY
    const H = el.offsetHeight
    const VH = window.innerHeight
    const sEnd = E + H - 0.08 * VH
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    const firstLine = el.querySelector('p')
    const op = () => getComputedStyle(firstLine).opacity
    window.scrollTo(0, E - VH - 50); await sleep(800)
    const before = op()
    window.scrollTo(0, E - VH * 0.85); await sleep(2500)
    const settled = op()
    window.scrollTo(0, sEnd + 200); await sleep(2500)
    const exitedUp = op()
    window.scrollTo(0, sEnd - 180); await sleep(400)
    const upMid = op()
    await sleep(2500)
    const upDone = op()
    return { before, settled, exitedUp, upMid, upDone }
  })()`
  console.log(JSON.stringify(await page.evaluate(probe), null, 1))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
