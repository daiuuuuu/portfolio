/** One-off audit screenshots: home + project detail, desktop & mobile. */
import { chromium } from 'playwright'
import * as fs from 'fs'

const BASE = 'http://localhost:5174/portfolio/'
const OUT = 'audit-shots'

async function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()

  const shots: Array<{ name: string; url: string; width: number; height: number; full?: boolean }> = [
    { name: 'home-top', url: BASE, width: 1440, height: 900 },
    { name: 'home-full', url: BASE, width: 1440, height: 900, full: true },
    { name: 'home-mobile', url: BASE, width: 390, height: 844, full: true },
    { name: 'detail-iw-top', url: BASE + 'project/image-workflow', width: 1440, height: 900 },
    { name: 'detail-iw-full', url: BASE + 'project/image-workflow', width: 1440, height: 900, full: true },
    { name: 'detail-iw-mobile', url: BASE + 'project/image-workflow', width: 390, height: 844, full: true },
    { name: 'detail-portfolio-full', url: BASE + 'project/portfolio-site', width: 1440, height: 900, full: true },
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
