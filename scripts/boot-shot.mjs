import { chromium } from 'playwright'

const BOOT = [
  'SYS.INIT ................. OK',
  'LOADING DESIGN TOKENS .... OK',
  'INDEXING 6 PROJECTS ...... OK',
  'MOUNTING AIGC_CORE_LOGIC . OK',
  'BOOT COMPLETE',
]
const totalChars = BOOT.join('').length

async function progress(page) {
  return page.evaluate((BOOT) => {
    const lineEls = [...document.querySelectorAll('[data-boot-line]')]
    const texts = lineEls.map((l) => l.textContent || '')
    if (!lineEls.length) return null
    let typingLine = -1
    let typingChars = 0
    let doneLines = 0
    for (let i = 0; i < BOOT.length; i++) {
      if (texts[i] === BOOT[i]) { doneLines++; continue }
      typingLine = i; typingChars = texts[i].length; break
    }
    const textPct =
      typingLine < 0 ? 100 : Math.round(((doneLines + typingChars / BOOT[typingLine].length) / BOOT.length) * 100)
    const bar = [...document.querySelectorAll('div')].find((d) => {
      const tx = (d.textContent || '').trim()
      return /^[█░]+$/.test(tx) && tx.length > 0
    })
    const barText = bar ? bar.textContent || '' : ''
    const filled = barText.split('█').length - 1
    // barTotal is internal; approximate it by measuring the container's char
    // capacity the same way the component does.
    const probe = document.createElement('span')
    const cs = getComputedStyle(bar)
    probe.style.fontFamily = cs.fontFamily
    probe.style.fontSize = cs.fontSize
    probe.style.letterSpacing = cs.letterSpacing
    probe.style.visibility = 'hidden'
    probe.style.whiteSpace = 'pre'
    probe.textContent = '█'
    bar.appendChild(probe)
    const charW = probe.offsetWidth || 5
    probe.remove()
    const capacity = Math.max(20, Math.floor(bar.offsetWidth / charW))
    const barPct = Math.round((filled / capacity) * 100)
    return { textPct, barPct, filled, capacity, charW, doneLines, typingLine, typingChars }
  }, BOOT)
}

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5173/portfolio/', { waitUntil: 'commit' })
  // Align t0 to when typing actually starts (first boot line gets text).
  await page.waitForFunction(() => {
    const l = document.querySelector('[data-boot-line]')
    return l && (l.textContent || '').length > 0
  }, { timeout: 15000 })
  const t0 = Date.now()

  const shots = [
    { label: 'early', ms: 200 },
    { label: 'mid', ms: 500 },
    { label: 'late', ms: 900 },
  ]
  for (const s of shots) {
    while (Date.now() - t0 < s.ms) await page.waitForTimeout(15)
    const p = await progress(page)
    await page.screenshot({ path: `audit-shots/boot/${s.label}.png` })
    console.log(
      `[${s.label}] at +${Date.now() - t0}ms  text(line)=${p?.textPct}%  bar=${p?.barPct}%  (${p?.filled}/${p?.capacity} @charW${p?.charW})  line${p?.typingLine} ${p?.typingChars}chars`,
    )
  }
  await browser.close()
}
main().catch((e) => { console.error(e); process.exit(1) })
