import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/animations/scrollReveal'

/** Elements that should show the square cursor. */
const INTERACTIVE_SELECTOR = 'a, button, [role="button"], [class*="cursor-pointer"]'

/**
 * CustomCursor — a DOM cursor that morphs between a crosshair and a hollow
 * square. The crosshair is built from 4 line segments: at rest the top+bottom
 * overlap on the horizontal centre line and the left+right overlap on the
 * vertical centre line (a "+"). Over an interactive element the segments
 * translate outward — top up, bottom down, left left, right right — forming a
 * square; leaving reverses it. The native cursor is hidden via
 * `body.cursor-custom` while this is active (added/removed on mount/unmount).
 *
 * Skipped for `prefers-reduced-motion` and coarse/touch pointers — those get
 * the static native crosshair/square cursor instead.
 */
export default function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const root = rootRef.current
    if (!root) return
    const q = gsap.utils.selector(root)
    const top = q('[data-cursor="top"]')
    const bottom = q('[data-cursor="bottom"]')
    const left = q('[data-cursor="left"]')
    const right = q('[data-cursor="right"]')
    if (!top.length) return

    document.body.classList.add('cursor-custom')

    // Morph timeline, paused at the crosshair state (segments overlapped at the
    // centre). Play → square (segments move to the 4 edges); reverse → crosshair.
    // Crosshair: top+bottom overlap on the horizontal centre line, left+right
    // on the vertical centre line. Square: they move out to the four edges.
    const tl = gsap.timeline({ paused: true })
    tl.to(top, { attr: { y1: 5, y2: 5 }, duration: 0.3, ease: 'power2.inOut' }, 0)
      .to(bottom, { attr: { y1: 23, y2: 23 }, duration: 0.3, ease: 'power2.inOut' }, 0)
      .to(left, { attr: { x1: 5, x2: 5 }, duration: 0.3, ease: 'power2.inOut' }, 0)
      .to(right, { attr: { x1: 23, x2: 23 }, duration: 0.3, ease: 'power2.inOut' }, 0)

    // Follow the mouse (transform on the fixed root, centred on the pointer).
    const xSet = gsap.quickSetter(root, 'x', 'px')
    const ySet = gsap.quickSetter(root, 'y', 'px')
    const onMove = (e: MouseEvent) => {
      xSet(e.clientX)
      ySet(e.clientY)
    }

    // Morph when crossing into/out of interactive elements (event delegation).
    let overInteractive = false
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element
      const now = !!t.closest?.(INTERACTIVE_SELECTOR)
      if (now === overInteractive) return
      overInteractive = now
      if (now) tl.play()
      else tl.reverse()
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)

    return () => {
      document.body.classList.remove('cursor-custom')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
    }
  }, { scope: rootRef })

  return (
    <div
      ref={rootRef}
      className="fixed top-0 left-0 z-[120] pointer-events-none mix-blend-difference"
      aria-hidden="true"
    >
      {/* Inner wrapper does the centering — GSAP moves the outer via x/y, which
          would otherwise overwrite a translate(-50%,-50%) on the same element. */}
      <div style={{ transform: 'translate(-50%, -50%)' }}>
        {/* 4 white line strokes blended with `difference` against the page: on
            dark backgrounds they appear light (泛白), on light backgrounds dark
            (泛黑) — a frosted-glass, background-adaptive cursor. */}
        <svg width="28" height="28" viewBox="0 0 28 28">
          <g stroke="#fff" strokeWidth="2">
            <line data-cursor="top" x1="5" y1="14" x2="23" y2="14" />
            <line data-cursor="bottom" x1="5" y1="14" x2="23" y2="14" />
            <line data-cursor="left" x1="14" y1="5" x2="14" y2="23" />
            <line data-cursor="right" x1="14" y1="5" x2="14" y2="23" />
          </g>
        </svg>
      </div>
    </div>
  )
}
