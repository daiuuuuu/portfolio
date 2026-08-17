import { useGSAP } from '@gsap/react'
import { useLocation } from 'react-router-dom'
import { initScrollReveals, ScrollTrigger } from '@/animations/scrollReveal'

/**
 * Mounts the scroll-driven reveal system for the current page.
 * Re-runs on every route change; useGSAP's revertOnUpdate kills all
 * ScrollTriggers of the previous page before the new ones are created.
 *
 * Reduced-motion users: no trigger is created at all — the page stays
 * fully visible and static.
 *
 * Resize and font-load events trigger a full rebuild: SplitText line
 * wrappers are reverted and re-split so clip-path masks always sit on the
 * correct visual line-breaks, and trigger bands are recalculated for the
 * new metric measurements.
 */
export function useScrollReveals(): void {
  const { pathname } = useLocation()

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      let state: ReturnType<typeof initScrollReveals> | null = null

      function start() {
        if (state) return
        state = initScrollReveals()
        // Images/iframes can shift layout after first paint — recalculate.
        ScrollTrigger.refresh()
      }

      // During the curtain transition the detail page mounts while the sheet is
      // still covering — building every SplitText line + ScrollTrigger here
      // would block the route render and freeze the sheet's exit. Defer the
      // initial init until the transition completes (`curtain-active` removed),
      // when the main thread is free. Below-the-fold reveals are invisible
      // anyway, so this costs nothing visible.
      let onEnd: (() => void) | null = null
      if (document.body.classList.contains('curtain-active')) {
        onEnd = () => {
          window.removeEventListener('transition:curtain-complete', onEnd!)
          onEnd = null
          start()
          // The detail page's below-fold layout keeps settling AFTER the sheet
          // parts (lazy images, pinned showcase sections, fonts). A couple of
          // re-measures stop any reveal trigger from keeping its pre-settle
          // position — which would leave text stuck masked until a refresh.
          window.setTimeout(() => ScrollTrigger.refresh(), 300)
          window.setTimeout(() => ScrollTrigger.refresh(), 800)
        }
        window.addEventListener('transition:curtain-complete', onEnd)
      } else {
        start()
      }

      // Async resources (fonts, lazy images, iframes) keep shifting layout
      // after init; refresh again when they settle so trigger bands stay true.
      const refresh = () => state && ScrollTrigger.refresh()

      // Full rebuild: revert old SplitText wrappers + kill ONLY the reveal
      // triggers (marquee, Xcu pin, hover effects are left untouched), then
      // re-init everything with correct line-breaks and geometry.
      const rebuild = () => {
        if (!state) return
        state.revertSplits()
        state.killTriggers()
        state = initScrollReveals()
        refresh()
      }

      window.addEventListener('load', refresh)
      // A3: re-split after font metrics settle — with a hard timeout fallback.
      // If the fonts' .ready promise never resolves (blocked CDN in China), the
      // rebuild must still run so content never stays stuck in hidden states.
      let fontTimer = 0
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => { clearTimeout(fontTimer); rebuild() }).catch(() => {})
        fontTimer = window.setTimeout(rebuild, 3000)
      }

      let resizeTimer: ReturnType<typeof setTimeout> | undefined
      const onResize = () => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(rebuild, 300) // A2: re-split after resize debounced
      }
      window.addEventListener('resize', onResize)

      // Lazy media without reserved dimensions expand the document when they
      // load mid-scroll — every load event re-measures trigger positions
      // (debounced; capture phase, load doesn't bubble).
      let mediaTimer: ReturnType<typeof setTimeout> | undefined
      const onMediaLoad = (e: Event) => {
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'IMG' || tag === 'VIDEO' || tag === 'IFRAME') {
          clearTimeout(mediaTimer)
          mediaTimer = setTimeout(refresh, 150)
        }
      }
      document.addEventListener('load', onMediaLoad, true)
      return () => {
        if (onEnd) window.removeEventListener('transition:curtain-complete', onEnd)
        window.removeEventListener('load', refresh)
        clearTimeout(fontTimer)
        window.removeEventListener('resize', onResize)
        clearTimeout(resizeTimer)
        document.removeEventListener('load', onMediaLoad, true)
        clearTimeout(mediaTimer)
        state?.revertSplits()
      }
    },
    { dependencies: [pathname], revertOnUpdate: true },
  )
}
