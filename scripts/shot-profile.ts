import { chromium } from 'playwright'
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5173/portfolio/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  // scroll to about section
  await page.evaluate(`document.querySelector('#profile').scrollIntoView()`)
  await page.waitForTimeout(2000)
  await page.screenshot({ path: 'audit-shots/after/profile-about.png' })
  // scroll down to see watermark experience
  await page.evaluate(`window.scrollBy(0, 900)`)
  await page.waitForTimeout(2000)
  await page.screenshot({ path: 'audit-shots/after/profile-exp.png' })
  // scroll to skills
  await page.evaluate(`document.querySelector('#contact').scrollIntoView()`)
  await page.evaluate(`window.scrollBy(0, -400)`)
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'audit-shots/after/profile-skills.png' })
  await browser.close()
  console.log('done')
}
main().catch(e => { console.error(e); process.exit(1) })
