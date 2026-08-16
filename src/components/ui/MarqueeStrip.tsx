import { useRef, useState, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/animations/scrollReveal'

interface MarqueeStripProps {
  text: string
  direction?: 'left' | 'right'
  className?: string
  /** Override font size (e.g. "clamp(120px,18vw,360px)"). Default: text-[20px] md:text-[24px] */
  fontSize?: string
  /** Override text color (e.g. "white"). Default: text-on-surface */
  color?: string
  /** Hide the top/bottom hairline borders. Default: shown */
  noBorder?: boolean
  /** Toggle the scroll-linked opacity reveal (data-reveal="marquee").
   *  Disable for background tickers where a fade on scroll causes flicker. Default: true */
  reveal?: boolean
  /** Vertical padding of the track (spacing between stacked bands). Default: '0.375rem' (py-1.5) */
  padY?: string
  /** Line-height of the band text (overrides leading-none). Values < 1 pull the
   *  glyphs tighter when stacking bands — use 0.7–0.8 for all-caps text. */
  lineHeight?: string
  /** Scroll speed — larger = faster horizontal travel per scroll unit.
   *  Default: 0.6. Give each stacked band a distinct value. */
  speed?: number
}

/**
 * MarqueeStrip — terminal ticker band, SCROLL-LINKED via a single scrub tween.
 *
 * x is driven by a fromTo mapped to the entire page's scroll (start: 0,
 * end: += halfWidth / SPEED).  direction="left" travels left on downward
 * scroll, "right" travels right — scrub naturally reverses on up-scroll.
 * Two identical halves make the loop seamless; the tween only ever moves
 * one halfWidth, so the visual never exposes a gap. The repeated text has
 * no inter-item gap (text.repeat), so the band reads as continuous.
 *
 * Reduced-motion users get a fully static band.
 */

function useRepeatCount(text: string): number {
  const [n, setN] = useState(8)
  useEffect(() => {
    const span = document.createElement('span')
    span.style.cssText =
      'font:800 24px/1 Geologica,Inter,sans-serif;position:absolute;visibility:hidden;white-space:nowrap'
    span.textContent = text
    document.body.appendChild(span)
    const need = Math.ceil((window.innerWidth * 2) / Math.max(span.offsetWidth, 1)) + 2
    setN(Math.max(8, need))
    document.body.removeChild(span)
  }, [text])
  return n
}

export default function MarqueeStrip({
  text,
  direction = 'left',
  className = '',
  fontSize,
  color,
  noBorder = false,
  reveal = true,
  padY = '0.375rem',
  lineHeight,
  speed = 0.6,
}: MarqueeStripProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const driftRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const trackTween = useRef<gsap.core.Tween | null>(null)
  const repeats = useRepeatCount(text)
  const half = text.repeat(repeats)

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const track = trackRef.current
    if (!track) return

    const halfWidth = track.scrollWidth / 2
    // Drift speed: 10px/s. Duration = halfWidth / 10 (each band has a different width).
    // Direction follows the band's direction: left drifts left, right drifts right.
    const driftEl = driftRef.current
    if (driftEl) {
      driftEl.style.animationDuration = `${Math.max(halfWidth / 10, 1)}s`
      driftEl.style.animationName =
        direction === 'right' ? 'marquee-drift-right' : 'marquee-drift-left'
    }
    // Always start at x=0. Both directions travel one halfWidth from the same
    // origin, so returning to the top (scroll position 0) always lands on the
    // same visual frame — no giant x jump from -halfWidth that would flicker.
    const endX = direction === 'right' ? halfWidth : -halfWidth

    // Scroll-linked travel (drives x on the track).
    trackTween.current = gsap.fromTo(track,
      { x: 0 },
      {
        x: endX,
        ease: 'none',
        scrollTrigger: {
          trigger: track,
          start: 0,
          end: `+=${Math.max(halfWidth / speed, 1)}`,
          scrub: 0.3,
        },
      },
    )

    // Auto-drift now runs as a pure CSS animation (.marquee-drift) on the drift
    // wrapper — native animation-play-state pauses/resumes it with zero snap.
    // The drift wrapper is as wide as the double-span track, so translateX(-50%)
    // equals -halfWidth and the loop is seamless.
  }, { scope: rootRef, dependencies: [direction, repeats, speed] })

  return (
    <div
      ref={rootRef}
      className={`overflow-hidden ${noBorder ? '' : 'border-y border-outline-variant'} ${className}`}
      {...(reveal ? { 'data-reveal': 'marquee' } : {})}
      style={{ lineHeight: 0 }}
    >
      {/* Auto-drift via CSS animation; hover-pause is handled in globals.css
          (.ticker-band:hover .marquee-drift { animation-play-state: paused }) */}
      <div ref={driftRef} className="relative w-max marquee-drift">
        <div
          ref={trackRef}
          className="flex whitespace-nowrap w-max py-1.5 text-[20px] md:text-[24px] text-on-surface"
          style={{
            fontFamily: 'Geologica, Inter, sans-serif',
            fontWeight: 800,
            letterSpacing: '-0.01em',
            // Inline overrides win over the utility classes above only when provided.
            fontSize: fontSize,
            color: color,
            paddingTop: padY,
            paddingBottom: padY,
          }}
        >
          <span className="shrink-0 block leading-none" style={lineHeight ? { lineHeight } : undefined}>{half}</span>
          <span className="shrink-0 block leading-none" style={lineHeight ? { lineHeight } : undefined} aria-hidden="true">{half}</span>
        </div>
      </div>
    </div>
  )
}
