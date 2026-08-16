import { chromium } from 'playwright'
import * as fs from 'fs'

const BASE = 'http://localhost:5174/portfolio/'
const OUT = 'audit-shots/after'

async function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  const shots = [
    { name: 'home-mobile', url: BASE, width: 390, height: 844, full: true },
    { name: 'detail-iw-mobile', url: BASE + 'project/image-workflow', width: 390, height: 844, full: true },
    { name: 'detail-iw-full', url: BASE + 'project/image-workflow', width: 1440, height: 900, full: true },
    { name: 'home-top', url: BASE, width: 1440, height: 900 },
  ]
  for (const s of shots) {
    const page = await browser.newPage({ viewport: { width: s.width, height: s.height } })
    await page.goto(s.url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: !!s.full })
    console.log(`✓ ${s.name}`)
    await page.close()
  }
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
