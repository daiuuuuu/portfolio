import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin)

/**
 * Scroll-driven reveal system — fully symmetric in/out structure.
 *
 * Core rule: ENTRANCE IS ALWAYS THE WIPE, EXIT IS ALWAYS THE FADE.
 *   scrolling down → lines wipe in (line by line) at the bottom edge,
 *                     fade out at the top edge
 *   scrolling up   → lines wipe in (line by line) at the top edge,
 *                     fade out at the bottom edge
 *
 * One ScrollTrigger per line spans the readable zone (`top 92%` → `top 15%`)
 * and drives the clip-path wipe (play on entry, reverse on exit, from either
 * edge). Opacity is owned by a separate scrub timeline that maps the whole
 * viewport journey: fade in at the bottom edge, fully lit through the
 * reading zone, fade out across the top 15% → 7% band. The fade playhead is
 * the scroll position itself — stop scrolling and it freezes mid-fade, so
 * content parked on screen never disappears on its own.
 *
 * - Text is split into lines (SplitText); each line stays put and is
 *   unmasked in place — no positional drift.
 * - The trigger band is computed from the line's own geometry, never from
 *   the card container, so lines reset/replay independently of card height.
 * - The line-by-line cadence emerges from position differences (~20px per
 *   line), not from a fixed time stagger.
 * - initial states are set by GSAP only. No-JS and reduced-motion users get
 *   the fully visible static page.
 * - transform + opacity + clip-path only. No layout properties.
 *
 * Markup API:
 *   data-reveal              → text inside appears line-by-line, left→right
 *   data-reveal="cover"      → image variant: fade only, no wipe
 *   data-reveal="marquee"    → ticker variant: fade only, no wipe
 *   data-reveal-group="xxx"  → siblings sharing a group stagger their start
 *                              lines by index (3% viewport per step, cap 12%)
 */

const LINE_DURATION = 1.4
const START_PCT = 92 // entrance line: element top crosses this viewport line
const TOP_FADE_START = 10 // top fade band: 10% → 7% (kept short so text near the
                          // top edge doesn't linger half-faded)
const TOP_FADE_END = 7
const STAGGER_STEP = 3
const STAGGER_CAP = 12
const TEXT_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, li'
// The widest any reveal start is pushed back by the group stagger, so a line
// whose top sits ABOVE this viewport band is guaranteed to be past its own
// trigger start — it must be fully revealed, never masked.
const SELF_HEAL_TOP = 78

// ── Self-heal: after every ScrollTrigger.refresh(), any wipe target currently
//    in the reading zone (line top between 10% and 78% of the viewport) is
//    force-revealed. refresh() rebuilds reveal triggers whose positions shifted
//    (a lazy image loading pushes layout), and rebuilding KILLS the old trigger
//    — taking its in-flight wipe tween with it, which then freezes the line at
//    whatever clip-path progress it had reached. That left text permanently
//    clipped (the XCU "missing text" bug). This pass makes an in-view line
//    impossible to keep hidden: the worst case is a line skipping the tail of
//    its ease, never a line staying invisible. ──
let activeWipeTargets: HTMLElement[] = []
function selfHealWipes(): void {
  const vh = window.innerHeight
  const lo = (TOP_FADE_START / 100) * vh
  const hi = (SELF_HEAL_TOP / 100) * vh
  for (const t of activeWipeTargets) {
    if (!t.isConnected) continue
    const top = t.getBoundingClientRect().top
    if (top < lo || top > hi) continue
    const cs = getComputedStyle(t)
    // A line/card in the reading zone must be fully revealed — force the clip
    // wipe open AND the exit-fade opacity back to 1. The exit journey (whole
    // table-row cards) can freeze at opacity 0 when its scrub measures stale
    // geometry (the curtain-entry XCU bug); the opacity journey can do the same
    // for lines. Both self-heal here.
    if (cs.clipPath.includes('inset') && !cs.clipPath.includes('inset(0% 0% 0% 0%)')) {
      gsap.set(t, { clipPath: 'inset(0% 0% 0% 0%)' })
    }
    if (parseFloat(cs.opacity) < 0.9) {
      gsap.set(t, { opacity: 1 })
    }
  }
}
ScrollTrigger.addEventListener('refresh', selfHealWipes)

/** Opacity journey: fade in at the bottom edge, lit in the reading zone,
 *  fade out across the top band. Scrub-linked — the playhead IS scroll position.
 *
 *  The top fade band is anchored to the element's BOTTOM edge, not its top:
 *  a tall image or big card stays fully lit until it is almost entirely out
 *  of the viewport, then its last visible sliver fades under the nav.
 *  For short text lines the two anchors nearly coincide, so their behavior
 *  is unchanged. Hold duration is therefore computed per element from its
 *  own height (1 duration unit == 1% viewport of scroll travel). */
function addOpacityJourney(target: HTMLElement): ScrollTrigger | null {
  const heightPct = (target.offsetHeight / window.innerHeight) * 100
  const FADE = 5 // % of viewport travel for the fade-in and fade-out segments
                // (shorter — content snaps in/out crisply instead of lingering)

  const journey = gsap.timeline({
    scrollTrigger: {
      trigger: target,
      start: 'top 100%',
      end: `bottom ${TOP_FADE_END}%`,
      scrub: 0.3,
    },
  })
  journey
    .fromTo(target, { opacity: 0 }, { opacity: 1, duration: FADE, ease: 'none' })
    .to(target, { opacity: 1, duration: Math.max(heightPct + 93 - FADE * 2, 1) })
    .to(target, { opacity: 0, duration: FADE, ease: 'none' })
  return journey.scrollTrigger || null
}

/**
 * Exit-only fade: the element dissolves as its bottom crosses the top band
 * (bottom ~12% → 7%), but never touches the entrance. Used for TABLE-LIKE rows
 * (data-reveal-group blocks, e.g. method comparison / stats) so the WHOLE row —
 * text, labels and border — fades out together, row by row, instead of the text
 * dissolving while the labels/frame stay crisp.
 */
function addExitJourney(target: HTMLElement): ScrollTrigger | null {
  // Whole-block exit fade, computed from the element's LIVE viewport position
  // on every update — not from a precomputed trigger band. Precomputed bands
  // get corrupted when a pinned section (XCU's horizontal reel) shifts the
  // layout below it, which froze table rows at opacity 0 (the recurring XCU
  // text bug). Live geometry is always truthful: opacity drops below 1 only
  // when the row's bottom genuinely crosses the top band, so an on-screen row
  // can never be stuck hidden.
  const fade = gsap.utils.mapRange(
    (TOP_FADE_START + 2) / 100, // bottom at ~12% ⇒ opacity 1
    TOP_FADE_END / 100, // bottom at 7% ⇒ opacity 0
    1,
    0,
  )
  const st = ScrollTrigger.create({
    trigger: target,
    start: 'top 95%',
    end: 'top 5%',
    onUpdate: () => {
      const bottom = target.getBoundingClientRect().bottom / window.innerHeight
      gsap.set(target, { opacity: fade(bottom) })
    },
  })
  return st
}

/**
 * Text-line variant: opacity journey (shared) + clip-path wipe driven by
 * threshold callbacks (play on entry, reverse on exit, from either edge).
 * clip-path and opacity never share a tween.
 */
function bindInOut(target: HTMLElement, start: number, entrance: gsap.core.Tween): ScrollTrigger {
  addOpacityJourney(target)

  return ScrollTrigger.create({
    trigger: target,
    start: `top ${start}%`,
    end: `top ${TOP_FADE_START}%`,
    onEnter: () => entrance.timeScale(1).play(),
    onLeave: () => entrance.timeScale(1.5).reverse(),
    onEnterBack: () => entrance.timeScale(1).play(),
    onLeaveBack: () => entrance.timeScale(1.5).reverse(),
  })
}

/** Wipe-only variant: plays/reverses the clip-path entrance but adds NO opacity
 *  journey — used for text lines inside table rows, where the whole-block exit
 *  (addExitJourney) owns the fade so the row dissolves as a unit. */
function bindWipeOnly(target: HTMLElement, start: number, entrance: gsap.core.Tween): ScrollTrigger {
  return ScrollTrigger.create({
    trigger: target,
    start: `top ${start}%`,
    end: `top ${TOP_FADE_START}%`,
    onEnter: () => entrance.timeScale(1).play(),
    onLeave: () => entrance.timeScale(1.5).reverse(),
    onEnterBack: () => entrance.timeScale(1).play(),
    onLeaveBack: () => entrance.timeScale(1.5).reverse(),
  })
}

/** Returns {revertSplit, killTriggers} so callers can tear down ONLY the
 *  triggers created here (not the MarqueeStrip, Xcu pin, or hover effects). */
export function initScrollReveals(): { revertSplits: () => void; killTriggers: () => void } {
  const splits: SplitText[] = []
  const triggers: ScrollTrigger[] = []
  const wipeTargets: HTMLElement[] = [] // clip-path wipe targets for self-heal

  // Resolve group stagger offsets: index of the element among siblings
  // carrying the same data-reveal-group value.
  const groupCache = new Map<string, HTMLElement[]>()
  const groupIndex = (el: HTMLElement, group: string): number => {
    if (!groupCache.has(group)) {
      groupCache.set(group, gsap.utils.toArray<HTMLElement>(`[data-reveal-group="${group}"]`))
    }
    return groupCache.get(group)!.indexOf(el)
  }

  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    const group = el.getAttribute('data-reveal-group')
    let start = START_PCT
    if (group) {
      start -= Math.min(groupIndex(el, group) * STAGGER_STEP, STAGGER_CAP)
    }

    if (el.dataset.reveal === 'cover' || el.dataset.reveal === 'marquee') {
      // Fade only — no clip unveil. The opacity journey handles both the
      // entrance (bottom edge) and the exit (top band).
      const st = addOpacityJourney(el)
      if (st) triggers.push(st)
      return
    }

    // Collect the text blocks living inside this reveal target.
    const blocks: HTMLElement[] = []
    if (el.matches(TEXT_SELECTOR) && el.textContent?.trim()) blocks.push(el)
    el.querySelectorAll<HTMLElement>(TEXT_SELECTOR).forEach((b) => {
      if (b.textContent?.trim()) blocks.push(b)
    })

    if (!blocks.length) {
      // No text inside (pure image/figure block, or a table/grid of cells).
      // Entrance stays a whole-block wipe, but the EXIT fades PER DIRECT CHILD:
      // a grid of cells/rows then fades row-by-row as each reaches the top band,
      // instead of the whole table dissolving the moment its edge touches it.
      // A single-child block (image/figure) still fades as a whole.
      const entrance = gsap.fromTo(
        el,
        { clipPath: 'inset(0% 100% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: LINE_DURATION, ease: 'expo.out', paused: true },
      )
      wipeTargets.push(el)
      const fadeUnits = el.children.length > 1
        ? Array.from(el.children) as HTMLElement[]
        : [el]
      for (const unit of fadeUnits) {
        const st = addOpacityJourney(unit)
        if (st) triggers.push(st)
      }
      // Wipe trigger for the entrance — inlined rather than bindInOut, which
      // would add a SECOND whole-block opacity journey and compound the fade.
      triggers.push(ScrollTrigger.create({
        trigger: el,
        start: `top ${start}%`,
        end: `top ${TOP_FADE_START}%`,
        onEnter: () => entrance.timeScale(1).play(),
        onLeave: () => entrance.timeScale(1.5).reverse(),
        onEnterBack: () => entrance.timeScale(1).play(),
        onLeaveBack: () => entrance.timeScale(1.5).reverse(),
      }))
      return
    }

    // Table-like rows (data-reveal-group) fade as a WHOLE unit on exit, row by
    // row — their text lines keep the per-line wipe entrance, but no per-line
    // opacity journey; the block itself gets the exit fade.
    const isTableRow = !!el.getAttribute('data-reveal-group')
    blocks.forEach((block) => {
      const split = new SplitText(block, { type: 'lines' })
      splits.push(split)
      ;(split.lines as HTMLElement[]).forEach((line) => {
        const entrance = gsap.fromTo(
          line,
          { clipPath: 'inset(0% 100% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: LINE_DURATION, ease: 'expo.out', paused: true },
        )
        wipeTargets.push(line)
        triggers.push(isTableRow ? bindWipeOnly(line, start, entrance) : bindInOut(line, start, entrance))
      })
    })
    if (isTableRow) {
      const st = addExitJourney(el)
      if (st) triggers.push(st)
      // The whole block (card/row) owns the exit fade — track it for the
      // opacity self-heal too, so a stale exit-journey scrub can never leave
      // an in-view card frozen at opacity 0.
      wipeTargets.push(el)
    }

    // Standalone media (gallery images, scans, videos) inside text-route
    // containers would otherwise stay dead while the text around them
    // animates — give them the same fade journey as covers.
    el.querySelectorAll<HTMLElement>('img, video').forEach((media) => {
      if (!blocks.some((b) => b.contains(media))) {
        const st = addOpacityJourney(media)
        if (st) triggers.push(st)
      }
    })
  })

  activeWipeTargets = wipeTargets
  return {
    revertSplits: () => splits.forEach((s) => s.revert()),
    killTriggers: () => triggers.forEach((t) => { try { t.kill() } catch { /* trigger may already be dead */ } }),
  }
}

/** Kill every ScrollTrigger — safety net for route transitions. */
export function killScrollReveals(): void {
  ScrollTrigger.getAll().forEach((t) => t.kill())
}

export { gsap, ScrollTrigger }
