import { chromium } from 'playwright'

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto('http://localhost:5174/portfolio/project/image-workflow', { waitUntil: 'networkidle' })
  const result = await page.evaluate(() => {
    const docW = document.documentElement.clientWidth
    const bad: Array<{ tag: string; cls: string; w: number; right: number }> = []
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect()
      if (r.width > docW + 1 || r.right > docW + 1) {
        bad.push({ tag: el.tagName.toLowerCase(), cls: (el.getAttribute('class') || '').slice(0, 90), w: Math.round(r.width), right: Math.round(r.right) })
      }
    })
    return { docW, scrollW: document.documentElement.scrollWidth, bad: bad.slice(0, 15) }
  })
  console.log(JSON.stringify(result, null, 2))
  await browser.close()
}

main().catch(e => { console.error(e); process.exit(1) })
