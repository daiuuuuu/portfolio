import { gsap } from '@/animations/scrollReveal'

// Staggered multi-sheet curtain — the community-proven pattern: stack
// full-screen panels, tween ONLY their xPercent with a stagger so each chases
// the next from right to left (never in sync), then settle offset so the left
// edges show a layered violet cascade.
const COVER_S = 0.5 // per-sheet cover duration
const EXIT_S = 0.55 // per-sheet exit duration
const STAGGER = 0.06 // cover: seconds between each sheet starting (visible chase)
const EXIT_STAGGER = 0.035 // exit: tighter stagger so the right-edge cascade stays
                           // readable (more bands fit in the viewport at once)
const STEP_PX = 44 // settled cascade step between sheets (their exposed sliver)
const LABEL_S = 0.25 // label fade in/out
const EASE = 'expo.inOut'

interface CurtainEls {
  sheets: HTMLElement[]
  label: HTMLElement | null
}

let curtain: CurtainEls | null = null

/** Mounted once by CurtainOverlay. All sheets start offscreen right. */
export function registerCurtain(els: CurtainEls): void {
  curtain = els
  gsap.set(els.sheets, { xPercent: 100 })
}

/** Pull the sheets leftward off-screen to reveal the new page (right → left). */
function reveal(): void {
  if (!curtain) return
  const { sheets, label } = curtain
  if (label) gsap.to(label, { opacity: 0, duration: LABEL_S, ease: 'power2.out' })
  gsap.to(sheets, {
    xPercent: -100,
    duration: EXIT_S,
    ease: EASE,
    // Reverse the stagger (main sheet first, deepest last) so the trailing
    // (right) edge shows the same layered cascade as the cover's left edge —
    // the sheets trail off to the left, leaving the layers peeking at the right.
    stagger: { each: EXIT_STAGGER, from: 'end' },
    // The page appears from the right edge as the sheets exit left — start the
    // detail hero's text entrance (gated on `transition:curtain-end`) here.
    onStart: () => window.dispatchEvent(new CustomEvent('transition:curtain-end')),
    onComplete: () => {
      document.body.classList.remove('curtain-active')
      // Sheets gone, main thread free — the scroll-reveal system (which defers
      // init while curtain-active) can build the page's reveals.
      window.dispatchEvent(new CustomEvent('transition:curtain-complete'))
    },
  })
}

/**
 * Catalog→detail curtain transition.
 *
 * Five full-screen violet sheets sweep in from the right edge in a staggered
 * chase (each starting just after the previous — never in sync), covering the
 * page and settling with their left edges forming a layered cascade. The route
 * swaps hidden beneath, then the sheets exit left (right → left reveal). The
 * project label appears after the route render finishes and fades out as the
 * sheets exit. Reduced-motion users get a plain navigation.
 */
export function curtainTransition(opts: {
  path: string
  navigate: (path: string) => void
  label?: string
}): void {
  const { path, navigate, label } = opts
  if (!curtain || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    navigate(path)
    return
  }
  const { sheets, label: labelEl } = curtain
  if (label && labelEl) {
    labelEl.querySelector('[data-curtain-label]')!.textContent = label
    gsap.set(labelEl, { opacity: 0 })
  }
  document.body.classList.add('curtain-active')

  // Cover: each sheet sweeps in from offscreen right to its settled offset
  // (sheet i rests i×STEP_PX in), staggered so they chase, never move in sync.
  gsap.set(sheets, { xPercent: 100 })
  gsap.to(sheets, {
    xPercent: (i: number) => (i * STEP_PX) / window.innerWidth * 100,
    duration: COVER_S,
    ease: EASE,
    stagger: STAGGER,
    onComplete: () => {
      // Swap the route hidden beneath the solid sheets. This synchronously
      // renders the detail page (blocking the main thread) — keep the sheets a
      // calm static hold during it; nothing animates.
      navigate(path)
      // Once the page has committed, announce it, then reveal. The ready marker
      // depends on the route: a project page exposes [data-project], the home
      // page's root exposes main[data-page="home"].
      const ready = path.startsWith('/project/')
        ? '[data-project]'
        : 'main[data-page="home"]'
      let poll = 0
      const announce = () => {
        window.clearInterval(poll)
        if (labelEl) {
          // Appear instantly — no fade-in tween: the below-fold scheme iframes
          // may still be loading here, and a main-thread tween would freeze
          // mid-fade.
          gsap.set(labelEl, { opacity: 1 })
          gsap.delayedCall(0.35, reveal)
        } else {
          reveal()
        }
      }
      poll = window.setInterval(() => {
        if (document.querySelector(ready)) announce()
      }, 30)
      window.setTimeout(announce, 2500) // safety: never leave the page covered
    },
  })
}
