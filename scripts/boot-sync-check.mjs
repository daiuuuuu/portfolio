import { chromium } from 'playwright'

const BOOT = [
  'SYS.INIT ................. OK',
  'LOADING DESIGN TOKENS .... OK',
  'INDEXING 6 PROJECTS ...... OK',
  'MOUNTING AIGC_CORE_LOGIC . OK',
  'BOOT COMPLETE',
]

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5173/portfolio/', { waitUntil: 'commit' })

  for (let t = 100; t <= 2200; t += 100) {
    await page.waitForTimeout(100)
    const s = await page.evaluate((BOOT) => {
      const lineEls = [...document.querySelectorAll('[data-boot-line]')]
      if (!lineEls.length) return null
      const texts = lineEls.map((l) => l.textContent || '')
      // find first line not yet complete = the one currently typing (or already cleared)
      let typingLine = -1
      let typingChars = 0
      let typingTotal = BOOT[0].length
      let doneLines = 0
      for (let i = 0; i < BOOT.length; i++) {
        if (texts[i] === BOOT[i]) {
          doneLines++
          continue
        }
        typingLine = i
        typingChars = texts[i].length
        typingTotal = BOOT[i].length
        break
      }
      // progress in units of "lines" (0..5)
      const textProgress =
        typingLine < 0
          ? BOOT.length
          : doneLines + typingChars / typingTotal

      const bar = [...document.querySelectorAll('div')].find((d) => {
        const tx = (d.textContent || '').trim()
        return /^[█░]+$/.test(tx) && tx.length > 0
      })
      const barText = bar ? bar.textContent || '' : ''
      const filled = barText.split('█').length - 1
      const barTotal = barText.length
      return { textProgress, doneLines, typingLine, typingChars, typingTotal, filled, barTotal }
    }, BOOT)

    if (!s) {
      console.log(`t=${String(t).padStart(4)}ms  overlay gone`)
      continue
    }
    const textPct = (s.textProgress / BOOT.length) * 100
    const barPct = s.barTotal ? (s.filled / s.barTotal) * 100 : 0
    console.log(
      `t=${String(t).padStart(4)}ms  text=${textPct.toFixed(1).padStart(5)}%  (line${s.typingLine} ${s.typingChars}/${s.typingTotal})   bar=${barPct.toFixed(1).padStart(5)}%  (${s.filled}/${s.barTotal})`,
    )
  }
  await browser.close()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
