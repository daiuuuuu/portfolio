import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/animations/scrollReveal'
import { charByChar } from '@/animations/charReveal'
import MarqueeStrip from '@/components/ui/MarqueeStrip'
import { SITE_CONFIG } from '@/config/site'

/** The five ticker bands, defined once — rendered as two stacked groups. */
const BANDS = [
  { text: 'DESIGN',               direction: 'left' as const,  fontSize: 'clamp(90px, 13vw, 312px)',  speed: 0.35 },
  { text: 'WORK/ ARCHIVE · ',     direction: 'right' as const, fontSize: 'clamp(48px, 8vw, 150px)',   speed: 0.6 },
  { text: 'AIGC',                 direction: 'left' as const,  fontSize: 'clamp(90px, 13vw, 312px)',  speed: 0.5 },
  { text: 'XUCHANG UNIVERSITY · ', direction: 'right' as const, fontSize: 'clamp(14px, 2.2vw, 32px)', speed: 1.4 },
  { text: 'KONGDEYU · ',          direction: 'left' as const,  fontSize: 'clamp(20px, 3.5vw, 56px)',  speed: 1.0 },
]

const TAG_TEXT = `${SITE_CONFIG.owner.handle.toUpperCase()} — DESIGN PRODUCTION`
const PORTFOLIO_TEXT = 'PORTFOLIO 2026'

export default function HeroSection() {
  const rootRef = useRef<HTMLElement>(null)
  const tagTextRef = useRef<HTMLSpanElement>(null)
  const portfolioRef = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // 2. Entrance choreography. On the FIRST load the boot overlay dispatches
    //    `boot:reveal` when it clears, then the scene slides/fades in. On SPA
    //    re-entry (e.g. returning home via the nav) the boot doesn't replay, so
    //    the scene plays directly — sculpture, bookmark and text assemble again.
    const root = rootRef.current
    if (!root) return
    const w = window as Window & { __bootRevealed?: boolean }

    const blocks = root.querySelector<HTMLElement>('[data-hero="blocks"]')
    const bands = Array.from(root.querySelectorAll<HTMLElement>('.ticker-band'))
    const tag = root.querySelector<HTMLElement>('[data-hero="tag"]')
    const sculpture = root.querySelector<HTMLElement>('[data-hero="sculpture"]')
    const seal = root.querySelector<HTMLElement>('[data-hero="seal"]')

    // Hidden initial states.
    // Color blocks slide in along the SAME local x-axis as the ticker bands
    // (the group is rotated 45°, so local -x = up-left in screen space). Using
    // translateX only keeps the travel a clean 45° diagonal — xPercent/yPercent
    // would mix the block's ~132vw-wide / 72vh-tall sizes into a skewed angle.
    if (blocks) gsap.set(blocks, { x: '-120vw' })
    bands.forEach((b, i) => {
      const dir = BANDS[i % BANDS.length].direction
      gsap.set(b, { x: dir === 'right' ? '-120vw' : '120vw' })
    })
    if (tag) gsap.set(tag, { xPercent: 105 })
    if (sculpture) gsap.set(sculpture, { x: '-100%' })
    // Seal rests at top:58px, so '-100%' of its height alone would leave its
    // bottom ~58px on-screen during the bands' entrance. Add a fixed margin so
    // the whole seal sits above the viewport before it drops in.
    if (seal) gsap.set(seal, { yPercent: -100, y: -80 })
    // Tag text hidden during the slide-in — revealed only after the bar settles.
    if (tagTextRef.current) gsap.set(tagTextRef.current, { opacity: 0 })
    if (portfolioRef.current) gsap.set(portfolioRef.current, { opacity: 0 })

    // Safety net: if an entrance timeline is ever killed mid-flight by a race
    // (route re-mount, GSAP context revert, ScrollTrigger refresh), force the
    // hero into its final visible state after the entrance would have finished
    // anyway — so the scene can NEVER stay frozen on the hidden purple frame.
    const safetyTimers: number[] = []

    const playEntrance = () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      // ── Stage 1 · background: color blocks + ticker bands. The seal (印章) is
      // always present in place — no entrance animation. ──
      if (blocks) tl.to(blocks, { x: 0, duration: 0.9, ease: 'power2.out' })
      if (bands.length) tl.to(bands, { x: 0, duration: 0.9 }, '<0.15')
      // ── Stage 2 · bookmark + seal: both start right after the bands settle,
      //    in sync. Bookmark slides in from the RIGHT along its 2° slant; the
      //    seal drops down from above, no fade. ──
      if (tag) tl.to(tag, { xPercent: 0, duration: 0.7 }, '+=0.1')
      tl.addLabel('bookmarkStart', '<') // anchor at tag's start, for sculpture timing
      if (seal) tl.to(seal, { yPercent: 0, y: 0, duration: 0.7, ease: 'power2.out' }, '<')
      // ── Text reveal: only after the slide completes. BOTH text groups type
      //    out character-by-character (boot-style), in parallel — the main line
      //    and the PORTFOLIO 2026 label reveal simultaneously. ──
      if (tagTextRef.current) {
        const textTl = gsap.timeline()
        textTl.set([tagTextRef.current, portfolioRef.current], { opacity: 1 }, 0)
        charByChar(textTl, tagTextRef.current, TAG_TEXT, undefined, 0.03)
        if (portfolioRef.current) {
          const portTl = gsap.timeline()
          charByChar(portTl, portfolioRef.current, PORTFOLIO_TEXT, undefined, 0.03)
          textTl.add(portTl, 0) // parallel with the main text reveal
        }
        textTl.eventCallback('onComplete', () => {
          // Resume the periodic re-glitch on the main text once the reveal settles.
          if (tagTextRef.current) {
            gsap.to(tagTextRef.current, {
              scrambleText: { text: TAG_TEXT, chars: '█▓▒░▚▞', speed: 0.5, revealDelay: 0.3 },
              duration: 0.8,
              repeat: -1,
              repeatDelay: 4,
            })
          }
        })
        tl.add(textTl, '+=0.05')
      }
      // ── Stage 3 · sculpture: still starts at the bookmark's midpoint (label +
      //    0.35 = half-way through the 0.7s slide), no opacity ──
      if (sculpture) tl.to(sculpture, { x: 0, duration: 0.7 }, 'bookmarkStart+=0.35')

      // Force-finish guard: a killed/paused timeline is the one way this scene
      // freezes hidden. After the entrance's full duration, snap every hero
      // element to its final state so the page always settles complete.
      let finished = false
      tl.eventCallback('onComplete', () => { finished = true })
      safetyTimers.push(window.setTimeout(() => {
        if (finished) return
        if (blocks) gsap.set(blocks, { x: 0 })
        gsap.set(bands, { x: 0 })
        if (tag) gsap.set(tag, { xPercent: 0 })
        if (seal) gsap.set(seal, { yPercent: 0, y: 0 })
        if (sculpture) gsap.set(sculpture, { x: 0 })
        if (tagTextRef.current) gsap.set(tagTextRef.current, { opacity: 1 })
        if (portfolioRef.current) gsap.set(portfolioRef.current, { opacity: 1 })
        tl.progress(1)
      }, 4000))
    }

    let cleanup: (() => void) | null = null
    if (w.__bootRevealed) {
      // Boot already completed (flag set by LoadingBoot or a prior entrance):
      // play the hero scene immediately.
      playEntrance()
    } else {
      let played = false
      const playOnce = () => {
        if (played) return
        played = true
        w.__bootRevealed = true
        playEntrance()
      }
      // The boot dispatches `boot:reveal` when it clears. If the hero mounts
      // AFTER that event (a slow first render), the listener below misses it and
      // the scene would stay hidden (a bare purple screen) on this load AND on
      // every SPA re-entry. Fallback: once the boot has certainly finished
      // (it waits ≤ 2.5s for its reveal image), play anyway and record the flag.
      window.addEventListener('boot:reveal', playOnce, { once: true })
      const fallback = window.setTimeout(playOnce, 2600)
      cleanup = () => {
        window.removeEventListener('boot:reveal', playOnce)
        window.clearTimeout(fallback)
      }
    }

    return () => {
      cleanup?.()
      safetyTimers.forEach((t) => window.clearTimeout(t))
    }

  }, { scope: rootRef })

  return (
    <section
      ref={rootRef}
      id="home"
      className="h-screen -mt-16 bg-brand-accent border-b border-outline relative overflow-hidden flex flex-col justify-center"
      data-section="home-hero"
    >
      {/* ── Sculpture — left aligned, top layer, occludes the ticker bands.
             Purple duotone baked into the asset (src/scripts gen): the darkest
             parts are EXACTLY the background brand purple #2E1065 so the statue
             blends into the scene; highlights are a lighter lavender. Cutout
             alpha preserved, so the ticker shows through the transparent parts. ── */}
      <img
        src="/portfolio/images/首屏-天使雕塑-紫色.webp"
        alt=""
        data-hero="sculpture"
        className="absolute inset-y-0 left-0 h-full w-auto max-w-none object-contain select-none pointer-events-none z-50 will-change-transform"
        draggable={false}
        decoding="async"
      />

      {/* ── Ticker bands — 5 bands as one group, duplicated as a second group below, tilted 45° ── */}
      <div
        className="relative z-10 ticker-group flex flex-col justify-center pt-[14vh]"
        style={{ transform: 'rotate(45deg)', transformOrigin: 'center center', marginLeft: -140, marginTop: 300 }}
      >
        {/* Ticker sequence wrapper — rectangle anchors to its top edge */}
        <div className="relative">
          {/* ── Two slanted rectangles — split VERTICALLY, exact 6px gap via flex gap ── */}
          <div
            data-hero="blocks"
            className="absolute right-[-2vw] flex gap-[6px] select-none pointer-events-none"
            style={{ bottom: 'calc(100% + 6px)' }}
            aria-hidden="true"
          >
            <div className="w-[44vw] h-[72vh] bg-[rgba(56,26,116,0.9)]" />
            <div className="w-[44vw] h-[72vh] bg-[rgba(56,26,116,0.9)]" />
            <div className="w-[44vw] h-[72vh] bg-[rgba(56,26,116,0.9)]" />
          </div>

          {[0, 1].map((group) => (
            <div key={group} className="flex flex-col">
              {BANDS.map((b) => (
                <MarqueeStrip
                  key={`${group}-${b.text}`}
                  text={b.text}
                  direction={b.direction}
                  noBorder
                  reveal={false}
                  padY="3px"
                  lineHeight="0.72"
                  speed={b.speed}
                  color="rgba(56,26,116,0.9)"
                  fontSize={b.fontSize}
                  className="ticker-band"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Bookmark tag — spans the full screen, right end anchored to right edge, text all on the right (left is occluded by sculpture) ── */}
      <div
        className="absolute left-0 right-0 bottom-5 z-20"
        style={{ transform: 'rotate(2deg)', transformOrigin: 'right center' }}
      >
        {/* data-hero on the inner wrapper: the slide (translateX) happens along
            this rotated parent's tilted axis, so the tag enters following its 2° slant
            instead of moving horizontally. */}
        <div data-hero="tag" className="relative w-full select-none pointer-events-none">
          {/* ── Bookmark head — left-pointing triangle with a rounded tip, same
                 fill + top/bottom hairline borders as the bar. Sits at the bar's
                 left end (right-full = its right edge at the bar's left edge),
                 slides with the tag, and shows during the right→left entrance. ── */}
          <svg
            className="absolute right-full top-0 h-full w-[36px] overflow-visible"
            viewBox="0 0 36 62"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M 36 0 L 14 28 Q 4 31 14 34 L 36 62 Z" fill="rgba(50,21,108,0.9)" />
            <path
              d="M 36 0 L 14 28 Q 4 31 14 34 L 36 62"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="5"
              strokeLinecap="butt"
            />
          </svg>
          <div className="flex items-center justify-end gap-8 px-[5%] py-5 bg-[rgba(50,21,108,0.9)] border-y-[5px] border-white/15">
            <span ref={tagTextRef} className="font-mono-technical text-[11px] md:text-[12px] text-white/90 uppercase tracking-[0.2em] leading-none">
              {TAG_TEXT}
            </span>
            <span ref={portfolioRef} className="font-mono-technical text-[10px] text-white/55 uppercase tracking-[0.2em] leading-none hidden md:block">
              PORTFOLIO 2026
            </span>
          </div>
          {/* ── Cinematic under-shadow — light strikes the tag, a dark gradient bleeds beneath it ── */}
          <div
            className="absolute top-full left-0 right-0 h-[38px]"
            style={{ background: 'linear-gradient(to bottom, rgba(8,4,18,0.175) 0%, rgba(8,4,18,0.175) 75%, rgba(8,4,18,0.045) 94%, transparent 100%)' }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* ── Decorative seal — top-right ── */}
      <img
        src="/portfolio/images/素材-蜡封.webp"
        alt=""
        data-hero="seal"
        className="absolute right-[152px] top-[58px] z-[60] w-[360px] select-none pointer-events-none"
        draggable={false}
        decoding="async"
      />

      {/* ── Bottom left metadata (horizontal) ── */}
      <div className="absolute bottom-6 left-6 font-mono-technical text-[10px] md:text-[11px] text-white/25 uppercase tracking-[0.15em]">
        <p>{SITE_CONFIG.owner.role} · {SITE_CONFIG.owner.location}</p>
        <p className="mt-0.5">{SITE_CONFIG.hero.statusLine}</p>
      </div>
    </section>
  )
}
