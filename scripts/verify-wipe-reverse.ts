import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  const probe = `(async () => {
    const card = document.querySelector('[data-section="philosophy"] [data-reveal]')
    const line = card.querySelector('p > div')
    const sleep = ms => new Promise(r => setTimeout(r, ms))
    const clipRight = () => {
      const c = getComputedStyle(line).clipPath
      if (c === 'none' || c === 'inset(0%)' || c === 'inset(0% 0% 0% 0%)') return 0
      // form: inset(0% 56.57% 0% 0%)
      const parts = c.replace('inset(', '').replace(')', '').split(' ')
      return parts.length >= 2 ? parseFloat(parts[1]) : -1
    }
    const VH = window.innerHeight
    const LT = () => line.getBoundingClientRect().top + window.scrollY

    window.scrollTo(0, LT() - VH * 0.85); await sleep(500)
    const midWipe = clipRight()

    window.scrollTo(0, LT() - VH + 60)
    const closing = []
    for (let i = 0; i < 4; i++) { await sleep(150); closing.push(clipRight()) }

    window.scrollTo(0, LT() - VH * 0.85)
    const reopening = []
    for (let i = 0; i < 5; i++) { await sleep(150); reopening.push(clipRight()) }

    return { midWipe, closing, reopening }
  })()`
  const r = await page.evaluate(probe)
  console.log(JSON.stringify(r, null, 1))
  const closing = (r as any).closing as number[]
  const reopening = (r as any).reopening as number[]
  const closesSmoothly = closing.every((v, i) => i === 0 || v >= closing[i - 1] - 0.5)
  const noJumpTo100 = reopening[0] < 99
  const opensAgain = reopening[reopening.length - 1] < reopening[0] + 0.5
  console.log('closes smoothly:', closesSmoothly, '| resumes not restart:', noJumpTo100, '| reopens:', opensAgain)
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
