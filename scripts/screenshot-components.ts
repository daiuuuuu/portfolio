/**
 * Screenshot all component library HTML files using Playwright.
 * Usage: npx tsx scripts/screenshot-components.ts
 */
import { chromium } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

const COMPONENT_DIR = 'D:/6_work/3_作品集网站/组件库'
const OUTPUT_DIR = 'public/images/components'
const VIEWPORT = { width: 1280, height: 900 }

async function main() {
  // Get all HTML files sorted by number
  const files = fs.readdirSync(COMPONENT_DIR)
    .filter(f => f.endsWith('.html') && /^\d{2}-/.test(f))
    .sort()

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  console.log(`Found ${files.length} component HTML files`)
  console.log(`Output directory: ${OUTPUT_DIR}\n`)

  const browser = await chromium.launch()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const filePath = path.join(COMPONENT_DIR, file)
    const fileUrl = `file:///${filePath.replace(/\\/g, '/')}`

    // Extract component name from filename: "01-TopNavBar-顶部导航栏.html" → "01-TopNavBar"
    const nameMatch = file.match(/^\d{2}-([^-]+)/)
    const compName = nameMatch ? nameMatch[1] : file.replace('.html', '')
    const outName = `${file.replace('.html', '')}.png`
    const outPath = path.join(OUTPUT_DIR, outName)

    console.log(`[${i + 1}/${files.length}] ${file} → ${outName}`)

    try {
      const context = await browser.newContext({ viewport: VIEWPORT })
      const page = await context.newPage()

      await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 15000 })

      // Wait for Tailwind CDN and Google Fonts to fully load
      await page.waitForTimeout(2000)

      // Try to find the documentation section and get its position
      // The doc section typically has classes like "px-margin-outer max-w-3xl mx-auto py-8"
      // We want to screenshot from top of page to just before the doc section (or full page)
      const docSection = await page.$('[class*="max-w-3xl"], .pt-24.px-margin-outer')

      if (docSection) {
        const docBox = await docSection.boundingBox()
        if (docBox && docBox.y > 100) {
          // Clip to component area only (from top to doc section start)
          await page.setViewportSize({
            width: VIEWPORT.width,
            height: Math.ceil(docBox.y)
          })
          await page.screenshot({
            path: outPath,
            fullPage: false,
          })
        } else {
          await page.screenshot({ path: outPath, fullPage: false })
        }
      } else {
        // No doc section found, screenshot the viewport
        await page.screenshot({ path: outPath, fullPage: false })
      }

      await context.close()
    } catch (err) {
      console.error(`  ✗ Failed: ${err instanceof Error ? err.message : err}`)
      // Create a placeholder text file noting the failure
      try { await context?.close() } catch {}
    }
  }

  await browser.close()
  console.log(`\nDone! Screenshots saved to ${OUTPUT_DIR}`)
}

main().catch(console.error)
