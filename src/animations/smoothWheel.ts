import gsap from 'gsap'

/**
 * Velocity-based smooth wheel (GSAP ticker).
 *
 * Instead of chasing a positional target, we track scroll *speed*:
 * 1. Each wheel event updates a "raw velocity" (exponentially smoothed,
 *    the same formula GSAP community examples use).
 * 2. A single gsap.ticker loop lerps current velocity → target velocity
 *    every frame — the SAME heartbeat as ScrollTrigger.
 * 3. When the wheel stops, target velocity naturally decays toward zero
 *    and the lerp smoothly brings the page to rest — no idle timer,
 *    no inertia phase, no mode switching.
 *
 * Inner scrollable containers (OCR panes, long-image previews) keep
 * their native wheel behaviour. Reduced-motion users get the native,
 * instant wheel.
 */

const VELOCITY_SCALE = 1.0 // no distance damping — the lerp IS the smoothing
const LERP = 0.3 // velocity smoothing — how fast actual speed chases target (acceleration)
const MAX_VELOCITY = 220 // px/frame cap (~13200 px/s) — top scroll speed & release velocity
const GLIDE_DECAY = 0.99 // idle glide decay per frame — a long, smooth momentum glide
const GLIDE_TAU = 1 / (1 - GLIDE_DECAY) // = 100 — glide travel from a given velocity
const MIN_REDIRECT_VELOCITY = 2 // px/ms (~120px/s) — minimum glide speed while steering to a card
// How long the wheel must be quiet before the glide counts as "released".
// 120ms — long enough that normal slow scrolling never trips it.
const SNAP_IDLE_MS = 120

/**
 * Optional page-specific glide redirect: given the current scroll position and
 * the glide's natural stopping point, return a target position to glide ONTO
 * (e.g. a card top) — or null to let the glide stop freely. Returning a target
 * makes the deceleration steer toward it, so alignment IS the inertia, not a
 * separate jump after it ends.
 */
type GlideRedirect = (position: number, naturalStop: number) => number | null
let glideRedirect: GlideRedirect | null = null
// Suppresses the snap redirect for a deliberate scroll (nav "Top" button), so
// the scroll-to-top isn't steered back onto a card as it passes the section.
let suppressSnap = false

export function setGlideRedirect(fn: GlideRedirect | null): void {
  glideRedirect = fn
}

export function setSuppressSnap(v: boolean): void {
  suppressSnap = v
}

export function initSmoothWheel(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight
  const clamp = (v: number) => Math.max(0, Math.min(v, maxScroll()))
  const proxy = { y: window.scrollY }
  let targetVel = 0
  let velocity = 0
  let lastTime = performance.now()
  let rawVel = 0
  let lastWheel = 0
  let settled = true

  /** Nearest scrollable ancestor that can scroll further in this direction. */
  const innerScroller = (el: EventTarget | null, deltaY: number): HTMLElement | null => {
    let node = el as HTMLElement | null
    while (node && node !== document.body) {
      const overflowY = getComputedStyle(node).overflowY
      if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
        const canDown = node.scrollTop < node.scrollHeight - node.clientHeight - 1
        const canUp = node.scrollTop > 1
        if ((deltaY > 0 && canDown) || (deltaY < 0 && canUp)) return node
      }
      node = node.parentElement
    }
    return null
  }

  /* ── Core loop: one ticker, same heartbeat as ScrollTrigger ── */
  gsap.ticker.add(() => {
    const now = performance.now()
    const idle = now - lastWheel > SNAP_IDLE_MS

    // Idle glide: decay the target velocity naturally, but if a glide redirect is
    // registered and the glide's natural stop is near a card, steer the target
    // velocity so the deceleration lands exactly on that card. This makes the
    // alignment part of the inertia (no cut, no jump after the glide).
    if (now - lastWheel > 40) {
      if (idle && glideRedirect && !suppressSnap) {
        const naturalStop = proxy.y + GLIDE_TAU * velocity
        const target = glideRedirect(proxy.y, naturalStop)
        if (target !== null) {
          const dist = target - proxy.y
          if (Math.abs(dist) < 10) {
            // Within the last few px — land exactly. scrollTo here too, because
            // the velocity-0 early return below skips the normal scrollTo.
            proxy.y = target
            window.scrollTo({ top: target, behavior: 'instant' })
            targetVel = 0
            velocity = 0
          } else {
            // Steer toward the card, but keep a minimum glide speed so the tail
            // doesn't crawl asymptotically for the last ~100px.
            let v = dist / GLIDE_TAU
            if (Math.abs(v) < MIN_REDIRECT_VELOCITY) v = Math.sign(v || 1) * MIN_REDIRECT_VELOCITY
            targetVel = gsap.utils.clamp(-MAX_VELOCITY, MAX_VELOCITY, v)
          }
        } else {
          targetVel *= GLIDE_DECAY
          if (Math.abs(targetVel) < 0.02) targetVel = 0
        }
      } else {
        targetVel *= GLIDE_DECAY
        if (Math.abs(targetVel) < 0.02) targetVel = 0
      }
    }

    velocity += (targetVel - velocity) * LERP
    if (Math.abs(velocity) < 0.02) {
      // Fully stopped — notify once per stop so a page can do a final gentle
      // alignment if the glide-edit didn't already land on a card.
      if (!settled && performance.now() - lastWheel > 60) {
        settled = true
        window.dispatchEvent(new CustomEvent('wheel:settle'))
      }
      velocity = 0
      return
    }
    settled = false
    velocity = gsap.utils.clamp(-MAX_VELOCITY, MAX_VELOCITY, velocity)
    proxy.y = clamp(proxy.y + velocity)
    window.scrollTo({ top: proxy.y, behavior: 'instant' })
  })

  /* ── Wheel listener: update target velocity ── */
  const onWheel = (e: WheelEvent) => {
    if (innerScroller(e.target, e.deltaY)) return
    e.preventDefault()

    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1
    const damped = e.deltaY * unit * VELOCITY_SCALE
    const now = performance.now()
    const dt = Math.max(now - lastTime, 1)
    rawVel = rawVel * 0.7 + (damped / dt) * 0.3 // exponential smooth (GSAP community standard)
    targetVel = gsap.utils.clamp(-MAX_VELOCITY, MAX_VELOCITY, rawVel)
    lastTime = now
    lastWheel = now
    settled = false
  }

  /* ── Pointer: kill momentum on grab ── */
  const onPointerDown = () => { velocity = 0; targetVel = 0; rawVel = 0; proxy.y = window.scrollY }
  /* ── External scroll (keyboard/scrollbar): sync proxy ── */
  const onScroll = () => {
    if (Math.abs(proxy.y - window.scrollY) > 2) { proxy.y = window.scrollY; velocity = 0; targetVel = 0; rawVel = 0 }
  }

  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('pointerdown', onPointerDown, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })

  return () => {
    window.removeEventListener('wheel', onWheel)
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('scroll', onScroll)
    targetVel = 0; velocity = 0; rawVel = 0
  }
}
