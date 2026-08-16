import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/animations/scrollReveal'
import { charByChar } from '@/animations/charReveal'

/** ASCII block-art logo — DAIU. Monospace-aligned. */
const ASCII_LOGO = `██████╗  █████╗ ██╗██╗   ██╗
██╔══██╗██╔══██╗██║██║   ██║
██║  ██║███████║██║██║   ██║
██║  ██║██╔══██║██║██║   ██║
██████╔╝██║  ██║██║╚██████╔╝
╚═════╝ ╚═╝  ╚═╝╚═╝ ╚═════╝`

/** Terminal boot lines — the final line renders brighter as the completion reveal. */
const BOOT_LINES = [
  'SYS.INIT ................. OK',
  'LOADING DESIGN TOKENS .... OK',
  'INDEXING 6 PROJECTS ...... OK',
  'MOUNTING AIGC_CORE_LOGIC . OK',
  'BOOT COMPLETE',
]

interface LoadingBootProps {
  onDone: () => void
}

/**
 * LoadingBoot — terminal boot sequence before the site appears.
 * Each character reveals one-by-one: it first shows as ASCII block noise, then
 * flickers into its real glyph (ScrambleTextPlugin with revealDelay). The ASCII
 * logo does the same char-by-char. A blinking cursor ticks, the progress bar
 * fills, then the boot content (logo, log lines, progress bar) fades out in
 * place — no slide-up — and dispatches `boot:reveal` so the hero's own entrance
 * choreography can begin the moment the scene clears.
 */
export default function LoadingBoot({ onDone }: LoadingBootProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onDone()
      return
    }
    const root = rootRef.current
    if (!root) return
    const q = gsap.utils.selector(root)
    const lines = q('[data-boot-line]')
    const cursor = cursorRef.current

    // Boot lines start invisible — pure background, no text yet.
    gsap.set(lines, { opacity: 0 })

    // Blinking cursor — follows the active line. Absolute-positioned at the
    // right end of the widest line; its top jumps to the line currently typing.
    if (cursor) {
      let maxW = 0
      lines.forEach((l) => {
        maxW = Math.max(maxW, (l as HTMLElement).offsetWidth)
      })
      gsap.set(cursor, {
        position: 'absolute',
        left: maxW + 10,
        top: 0,
        opacity: 1,
      })
      gsap.to(cursor, {
        opacity: 0,
        duration: 0.5,
        yoyo: true,
        repeat: -1,
        ease: 'steps(1)',
      })
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => {
        // The wheel can fast-forward the boot before the hero's images/fonts
        // finish loading — wait for them (with a 3s cap) so the reveal never
        // shows a half-loaded scene.
        const reveal = () => {
          // Mark the boot as done GLOBALLY, independent of the hero being
          // mounted. If the first load lands on a project page (reload/bookmark)
          // the hero never listens for `boot:reveal`, so this flag is the only
          // signal a later hero mount has to skip the slow fallback path — the
          // bug that left the hero frozen on the purple frame for ~3s.
          ;(window as unknown as { __bootRevealed?: boolean }).__bootRevealed = true
          // Dispatch in a macrotask so the hero entrance starts AFTER this
          // overlay unmounts — a synchronous dispatch inside the timeline's tick
          // can be swallowed by GSAP before the hero's timeline gets to render.
          setTimeout(() => window.dispatchEvent(new Event('boot:reveal')), 20)
          onDone()
        }
        const img = document.querySelector<HTMLImageElement>('[data-hero="sculpture"]')
        const imgReady = !img || (img.complete && img.naturalWidth > 0)
        if (imgReady) {
          reveal()
          return
        }
        let settled = false
        let timer = 0
        const finish = () => {
          if (settled) return
          settled = true
          window.clearTimeout(timer)
          img?.removeEventListener('load', finish)
          img?.removeEventListener('error', finish)
          reveal()
        }
        timer = window.setTimeout(finish, 2500)
        img?.addEventListener('load', finish)
        img?.addEventListener('error', finish)
      },
    })

    // ASCII logo is static — no animation, sits on the background.

    // Full-width ASCII progress bar, filled on line-equal progress so its fill
    // always matches the text's visible completion (bar = text at every moment,
    // both reach 100% together).
    const barEl = barRef.current
    // Measure the real advance of one '█' under the bar's own computed styles,
    // so barTotal chars exactly fill the container. A hardcoded 4px/char was
    // ~20% too few chars → the bar looked full at ~80% progress, before the
    // text finished. Measured → bar hits the right edge exactly at 100%.
    const measureCharW = (): number => {
      if (!barEl) return 5
      const cs = getComputedStyle(barEl)
      const probe = document.createElement('span')
      probe.style.fontFamily = cs.fontFamily
      probe.style.fontSize = cs.fontSize
      probe.style.letterSpacing = cs.letterSpacing
      probe.style.visibility = 'hidden'
      probe.style.whiteSpace = 'pre'
      probe.textContent = '█'
      barEl.appendChild(probe)
      const w = probe.offsetWidth
      probe.remove()
      return w || 5
    }
    const barTotal = barEl ? Math.max(20, Math.floor(barEl.offsetWidth / measureCharW())) : 60
    const onProgress = (frac: number) => {
      if (!barEl) return
      const filled = Math.min(barTotal, Math.round(frac * barTotal))
      // White █ fill only — no gray ░ track. NBSP keeps the line height reserved
      // at 0% so the layout never shifts as the bar grows.
      tl.set(barEl, { textContent: '█'.repeat(filled) || ' ' })
    }

    // Each boot line reveals strictly character-by-character; the progress bar
    // advances one step per character, in sync. Fast tick → whole sequence ~2s.
    const totalLines = lines.length
    lines.forEach((line, idx) => {
      tl.set(line, { opacity: 1 })
      // Cursor jumps to this line's right end as it starts typing.
      if (cursor) tl.set(cursor, { top: (line as HTMLElement).offsetTop + 2 })
      const lineLen = line.textContent?.length ?? 0
      charByChar(tl, line, line.textContent ?? '', onProgress, 0.01, idx, lineLen, totalLines)
    })

    // Reveal: fade the boot content out in place (logo, log lines, progress bar).
    // The overlay's purple bg matches the hero bg exactly, so removing the overlay
    // right after is seamless. Dispatch `boot:reveal` so the hero's entrance can
    // start the instant the scene clears.
    tl.to(
      q('[data-boot-logo], [data-boot-mid], [data-boot-bottom]'),
      { opacity: 0, duration: 0.45, ease: 'power1.out', stagger: 0.04 },
      '+=0.15',
    )

    // Wheel fast-forward: rolling the wheel skips the boot forward so an
    // impatient viewer can finish it quickly. Page scroll is locked by
    // RootLayout while booting, so the wheel drives only this.
    const skipOnWheel = () => {
      if (tl.progress() < 1) tl.progress(Math.min(1, tl.progress() + 0.15))
    }
    window.addEventListener('wheel', skipOnWheel, { passive: true })
    return () => window.removeEventListener('wheel', skipOnWheel)
  }, { scope: rootRef })

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] bg-brand-accent flex flex-col justify-between p-8 overflow-hidden"
      aria-hidden="true"
    >
      {/* ASCII logo */}
      <div
        data-boot-logo
        className="font-mono-technical text-white/70 text-[9px] md:text-[11px] leading-tight whitespace-pre select-none"
      >
        {ASCII_LOGO}
      </div>

      {/* Boot log + blinking cursor (absolute, follows the active line) */}
      <div
        data-boot-mid
        className="relative font-mono-technical text-[12px] md:text-[13px] uppercase tracking-[0.15em] leading-relaxed"
      >
        {BOOT_LINES.map((l) => (
          <p
            key={l}
            data-boot-line
            className={`whitespace-pre ${l === 'BOOT COMPLETE' ? 'text-white' : 'text-white/80'}`}
          >
            {l}
          </p>
        ))}
        <span ref={cursorRef} className="text-white/80">▊</span>
      </div>

      {/* ASCII progress bar + status */}
      <div data-boot-bottom className="w-full">
        <div
          ref={barRef}
          className="font-mono-technical text-white/80 text-[6px] md:text-[7px] leading-none tracking-[0.15em] whitespace-pre select-none overflow-hidden"
        >
          {/* Invisible NBSP reserves the line height at 0% — no gray ░ track,
              the white █ fill grows alone and the layout never shifts. */}
          {' '}
        </div>
        <p className="font-mono-technical text-[10px] text-white/40 uppercase tracking-[0.2em] mt-2">
          SYS.VER 2026.08 // LOADING
        </p>
      </div>
    </div>
  )
}
