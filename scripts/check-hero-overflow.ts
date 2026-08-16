import { chromium } from 'playwright'

async function main() {
  const browser = await chromium.launch()
  for (const slug of ['image-workflow', 'duanfu', 'portfolio-site', 'video-factory', 'xcu', 'guji']) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await page.goto(`http://localhost:5174/portfolio/project/${slug}`, { waitUntil: 'networkidle' })
    const r = await page.evaluate(() => {
      const h1 = document.querySelector('[data-animate="project-hero-title"] h1')
      if (!h1) return null
      return { text: h1.textContent, scrollW: (h1 as HTMLElement).scrollWidth, clientW: (h1 as HTMLElement).clientWidth }
    })
    console.log(slug, JSON.stringify(r))
    await page.close()
  }
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })
