import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls to top instantly on route change.
 * useLayoutEffect = runs before browser paint, so the user never sees the old position.
 * behavior: 'instant' = overrides the CSS scroll-behavior: smooth so there is no animation.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return null
}
