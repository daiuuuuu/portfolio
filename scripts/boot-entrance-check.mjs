import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5173/portfolio/', { waitUntil: 'commit' })

for (let t = 0; t <= 3200; t += 200) {
  await page.waitForTimeout(200)
  const s = await page.evaluate(() => {
    const overlayGone = !document.querySelector('[data-boot-line]')
    const read = (sel) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const cs = getComputedStyle(el)
      const tr = el.getBoundingClientRect()
      return { transform: cs.transform, opacity: cs.opacity, top: Math.round(tr.top), left: Math.round(tr.left) }
    }
    return {
      overlayGone,
      revealed: window.__bootRevealed === true,
      sculpture: read('[data-hero="sculpture"]'),
      seal: read('[data-hero="seal"]'),
      tag: read('[data-hero="tag"]'),
      band: read('.ticker-band'),
      blocks: read('[data-hero="blocks"]'),
    }
  })
  console.log(`t=${String(t).padStart(4)}ms  overlayGone=${s.overlayGone}  revealed=${s.revealed}`)
  console.log(`   sculpture opacity=${s.sculpture?.opacity} x(left)=${s.sculpture?.left}`)
  console.log(`   seal opacity=${s.seal?.opacity}   band x(left)=${s.band?.left}   tag left=${s.tag?.left}   blocks top=${s.blocks?.top}`)
}
await browser.close()
