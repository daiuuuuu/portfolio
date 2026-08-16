import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ScrollToTop from '@/components/shared/ScrollToTop'
import TopNavBar from '@/components/navigation/TopNavBar'
import Footer from '@/components/shared/Footer'
import LoadingBoot from '@/components/ui/LoadingBoot'
import CustomCursor from '@/components/ui/CustomCursor'
import CurtainOverlay from '@/components/ui/CurtainOverlay'
import { useScrollReveals } from '@/animations/useScrollReveals'
import { initSmoothWheel } from '@/animations/smoothWheel'

export default function RootLayout() {
  const location = useLocation()
  const isProjectPage = location.pathname.startsWith('/project/')
  const [booting, setBooting] = useState(true)
  useScrollReveals()

  // Lock page scroll while the boot overlay is up, so the scene can't be
  // scrolled out from under it (overflow hidden blocks native wheel/keyboard/
  // touch scroll). The moment the boot clears: unlock, return to top, and only
  // then start smooth-wheel.
  useEffect(() => {
    document.documentElement.style.overflow = booting ? 'hidden' : ''
    if (!booting) window.scrollTo({ top: 0, behavior: 'instant' })
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [booting])

  // Smooth-wheel starts only AFTER the boot — never while the overlay is up.
  useEffect(() => {
    if (booting) return
    return initSmoothWheel()
  }, [booting])

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-[6px]">
      {booting && <LoadingBoot onDone={() => setBooting(false)} />}
      <ScrollToTop />
      <TopNavBar isProjectPage={isProjectPage} />
      <main className="flex-1 pt-16" data-page={isProjectPage ? 'project' : 'home'}>
        <Outlet />
      </main>

      <Footer />

      {/* ── Morphing custom cursor (crosshair ↔ square) ── */}
      <CustomCursor />

      {/* ── Curtain transition overlay (catalog → detail) ── */}
      <CurtainOverlay />

      {/* ── Purple frame — fixed hairline (6px) on all four edges, every page ── */}
      <div className="fixed top-0 left-0 right-0 h-[6px] bg-brand-accent z-[60] pointer-events-none" aria-hidden="true" />
      <div className="fixed bottom-0 left-0 right-0 h-[6px] bg-brand-accent z-50 pointer-events-none" aria-hidden="true" />
      <div className="fixed left-0 top-0 bottom-0 w-[6px] bg-brand-accent z-50 pointer-events-none" aria-hidden="true" />
      <div className="fixed right-0 top-0 bottom-0 w-[6px] bg-brand-accent z-50 pointer-events-none" aria-hidden="true" />
    </div>
  )
}
