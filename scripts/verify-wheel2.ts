import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5174/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.mouse.move(720, 450)
  await page.mouse.wheel(0, 100)
  const t = [60, 150, 300, 600]
  const samples: number[] = []
  for (const ms of t) { await page.waitForTimeout(ms === 60 ? 60 : ms - t[t.indexOf(ms) - 1]); samples.push(await page.evaluate('window.scrollY') as number) }
  console.log('one-notch settle curve (target 50px):', samples.map(Math.round).join(' → '))
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
