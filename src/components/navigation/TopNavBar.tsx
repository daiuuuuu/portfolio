import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/animations/scrollReveal'
import { setSuppressSnap } from '@/animations/smoothWheel'
import { curtainTransition } from '@/animations/curtainTransition'
import { SITE_CONFIG } from '@/config/site'

interface TopNavBarProps {
  isProjectPage?: boolean
}

/** Home nav sections — native anchors. */
const NAV_SECTIONS = [
  { id: 'home', label: 'HOME' },
  { id: 'profile', label: 'PROFILE' },
  { id: 'projects', label: 'WORKS' },
  { id: 'contact', label: 'CONTACT' },
]

/** Project page quick-jumps — the three key sections (overview, Q&A, next). */
const PROJECT_SECTIONS = [
  { section: 'project-overview', label: 'OVERVIEW' },
  { section: 'project-decisions', label: 'Q&A' },
  { section: 'project-next', label: 'NEXT' },
]

export default function TopNavBar({ isProjectPage = false }: TopNavBarProps) {
  const navigate = useNavigate()
  const navRef = useRef<HTMLElement>(null)
  const topTweenRef = useRef<gsap.core.Tween | null>(null)

  // Smoothly glide the CURRENT page to a y position — the shared engine behind
  // "↑ Top" and the project quick-jumps. Suppresses the catalog snap redirect
  // for the duration, otherwise the glide steering would pull the scroll back
  // onto a snapped card while passing the section.
  const scrollToY = (targetY: number) => {
    setSuppressSnap(true)
    const proxy = { y: window.scrollY }
    topTweenRef.current?.kill()
    topTweenRef.current = gsap.to(proxy, {
      y: targetY,
      duration: 0.8,
      ease: 'power2.inOut',
      onUpdate: () => window.scrollTo({ top: proxy.y, behavior: 'instant' }),
      onComplete: () => { setSuppressSnap(false); topTweenRef.current = null },
    })
  }
  const scrollTop = () => scrollToY(0)

  // A wheel input while the Top tween runs cancels it and re-enables snapping.
  useEffect(() => {
    const cancel = () => {
      topTweenRef.current?.kill()
      topTweenRef.current = null
      setSuppressSnap(false)
    }
    window.addEventListener('wheel', cancel, { passive: true })
    return () => {
      window.removeEventListener('wheel', cancel)
      topTweenRef.current?.kill()
      topTweenRef.current = null
      setSuppressSnap(false)
    }
  }, [])

  // Project page quick-jump: glide (like ↑ Top) to a key section on the current
  // page. The section lands 15% of the viewport down, below the reveal system's
  // top fade band — so its first lines are fully visible instead of fading out
  // right at the viewport edge.
  const goProjectSection = (section: string) => {
    const el = document.querySelector<HTMLElement>(`[data-section="${section}"]`)
    if (!el) return
    const TOP_OFFSET = Math.round(window.innerHeight * 0.15)
    scrollToY(el.getBoundingClientRect().top + window.scrollY - TOP_OFFSET)
  }

  // Project pages always keep an opaque surface background — the home
  // hero-reveal manages the nav's transparency on the home page, but entering a
  // project page (via the curtain transition) can leave a transparent state in
  // some browsers. Set it explicitly to the theme tokens.
  useEffect(() => {
    const nav = navRef.current
    if (!nav || !isProjectPage) return
    nav.style.backgroundColor = 'var(--color-surface)'
    nav.style.borderColor = 'var(--color-outline)'
  }, [isProjectPage])

  /* ── Hero → Nav reveal (home page only) ───────────────────── */
  useGSAP(() => {
    if (isProjectPage) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const nav = navRef.current!
    const links = nav.querySelectorAll('.nav-link')

    // Nav bg + border + text: all hidden initially on hero.
    gsap.set(nav, { backgroundColor: 'transparent', borderColor: 'transparent' })
    gsap.set(links, { opacity: 0, y: 16 })
    const textTl = gsap.timeline({ paused: true })
    textTl.to(links, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.04 }, 0)

    const createHeroTriggers = () => {
      ScrollTrigger.create({
        trigger: '#home',
        start: 'bottom top',
        toggleActions: 'play none reverse none',
        onEnter: () => { gsap.set(nav, { backgroundColor: '#fcf9f8' }); textTl.play() },
        onLeaveBack: () => { gsap.set(nav, { backgroundColor: 'transparent' }); textTl.timeScale(3).reverse() },
      })
      ScrollTrigger.create({
        trigger: '#home',
        start: 'bottom+=232 top',
        onEnter: () => gsap.set(nav, { borderColor: '#75777a' }),
        onLeaveBack: () => gsap.set(nav, { borderColor: 'transparent' }),
      })
      ScrollTrigger.refresh()
    }
    requestAnimationFrame(createHeroTriggers)

    // Returning home via the curtain: the hero may be measured while the sheet
    // is still covering (stale height), which can leave the border trigger in a
    // wrong "entered" state → the hairline shows over the hero. Once the reveal
    // finishes, kill the hero triggers and rebuild them against the settled
    // layout, so the border fires at its correct position (past the hero).
    const onCurtainEnd = () => {
      ScrollTrigger.getAll()
        .filter((t) => (t.trigger as HTMLElement | null)?.id === 'home')
        .forEach((t) => t.kill())
      createHeroTriggers()
    }
    window.addEventListener('transition:curtain-complete', onCurtainEnd)

    // Leaving the home page (route change): strip any GSAP-applied nav colors.
    // revertOnUpdate also reverts, but this is explicit — project pages must
    // never inherit a transparent background/border from the hero reveal.
    return () => {
      window.removeEventListener('transition:curtain-complete', onCurtainEnd)
      const navEl = navRef.current
      if (navEl) gsap.set(navEl, { clearProps: 'backgroundColor,borderColor' })
    }
  }, { scope: navRef, dependencies: [isProjectPage], revertOnUpdate: true })

  return (
    <nav ref={navRef} className={`fixed top-0 z-50 w-full h-16 bg-surface border-b border-outline transition-none ${isProjectPage ? 'nav-project-solid' : ''}`}>
      <div className="h-full px-margin-outer flex items-center justify-between gap-4">

        {/* Logo is a static mark — no navigation (HOME in the nav handles it). */}
        <span className="nav-link font-headline-lg-mobile text-[28px] md:text-headline-lg-mobile leading-none font-bold text-on-surface tracking-tighter whitespace-nowrap">
          DAIU_ARCHIVE
        </span>

        <div className="flex items-center gap-4 md:gap-6">
          {isProjectPage ? (
            /* Project page: HOME (returns to the home page) + quick-jumps to the
               page's key sections. */
            <div className="hidden lg:flex gap-5">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  curtainTransition({ path: '/', navigate })
                }}
                className="nav-link font-label-micro text-label-micro uppercase tracking-widest text-on-surface border-b border-on-surface"
              >
                HOME
              </a>
              {PROJECT_SECTIONS.map(({ section, label }) => (
                <button
                  key={section}
                  onClick={() => goProjectSection(section)}
                  className="nav-link font-label-micro text-label-micro uppercase tracking-widest text-on-surface-variant scanlines-hover"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            /* Home page: native section anchors. */
            <div className="hidden lg:flex gap-5">
              {NAV_SECTIONS.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`nav-link font-label-micro text-label-micro uppercase tracking-widest ${id === 'home' ? 'text-on-surface border-b border-on-surface' : 'text-on-surface-variant scanlines-hover'}`}
                >
                  {label}
                </a>
              ))}
            </div>
          )}

          <button onClick={scrollTop} className="nav-link font-label-micro text-label-micro uppercase tracking-widest px-3 py-2 border border-outline hover:bg-on-surface hover:text-surface transition-none">
            <span className="hidden sm:inline">↑ Top</span>
            <span className="sm:hidden">↑</span>
          </button>

          <a href={SITE_CONFIG.owner.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="nav-link text-on-surface-variant hover:text-on-surface">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
        </div>
      </div>
    </nav>
  )
}
