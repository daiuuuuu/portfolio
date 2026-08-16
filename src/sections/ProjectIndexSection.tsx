import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/animations/scrollReveal'
import { setGlideRedirect } from '@/animations/smoothWheel'
import { getAllProjects } from '@/data/projects'
import ProjectIndexItem from '@/components/project/ProjectIndexItem'

/** Nav height — cards are min-h-[calc(100vh-4rem)]; aligning below it fills the viewport. */
const NAV_OFFSET = 64
/** Steer the glide onto a card whenever its natural stop is within this many px
 *  of a card top. Cards are ~836px apart, so 420 covers every possible stop —
 *  any natural stop in the section redirects to the nearest card. */
const SNAP_RADIUS = 420

/** Six projects, one reusable full-screen module per project. */
export default function ProjectIndexSection() {
  const projects = getAllProjects()
  const sectionRef = useRef<HTMLElement>(null)

  // Register a glide redirect with the smooth wheel: during the idle glide, if
  // the glide's natural stopping point lands near a card top, steer the
  // deceleration onto that card — so card alignment IS part of the inertia
  // (smooth, never a separate jump after the glide ends, never a mid-glide cut).
  useGSAP(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const cards = gsap.utils.toArray<HTMLElement>('[data-project-index]', section)
    if (!cards.length) return

    // Full-screen card snapping is DESKTOP-only. The smooth wheel's glide
    // steering is wheel-driven; on mobile (<768) the works index scrolls freely
    // with native touch and NO snap — the user's explicit choice. gsap.matchMedia
    // registers the redirect + settle fallback only ≥768px and tears them down
    // below, so a rotated phone or a narrow window never snaps.
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px)', () => {
      // Primary: register a glide redirect — during the idle glide, if the glide's
      // natural stopping point lands near a card top, steer the deceleration onto
      // that card. Alignment IS the inertia (smooth, during the glide).
      setGlideRedirect((position, naturalStop) => {
        const firstTop = cards[0].getBoundingClientRect().top + window.scrollY - NAV_OFFSET
        const lastTop = cards[cards.length - 1].getBoundingClientRect().top + window.scrollY - NAV_OFFSET
        // Engage while the PAGE is within (or just before/after) the section — the
        // natural stop itself can sit just above the first card and still pull down.
        if (position < firstTop - SNAP_RADIUS || position > lastTop + SNAP_RADIUS) return null

        let bestTop = Infinity
        let bestDist = Infinity
        for (const c of cards) {
          const top = c.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
          const d = Math.abs(top - naturalStop)
          if (d < bestDist) { bestDist = d; bestTop = top }
        }
        if (bestDist > SNAP_RADIUS) return null
        return bestTop
      })

      // Fallback: if a stop fully settles without landing on a card (marginal
      // momentum that the redirect didn't steer), do one gentle final alignment.
      let fallbackTween: gsap.core.Tween | null = null
      const onSettle = () => {
        const scroll = window.scrollY
        const firstTop = cards[0].getBoundingClientRect().top + window.scrollY - NAV_OFFSET
        const lastTop = cards[cards.length - 1].getBoundingClientRect().top + window.scrollY - NAV_OFFSET
        if (scroll < firstTop - SNAP_RADIUS || scroll > lastTop + SNAP_RADIUS) return

        let bestTop = Infinity
        let bestDist = Infinity
        for (const c of cards) {
          const top = c.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
          const d = Math.abs(top - scroll)
          if (d < bestDist) { bestDist = d; bestTop = top }
        }
        if (bestDist <= 4 || bestDist > SNAP_RADIUS) return // already aligned, or out of reach
        const proxy = { y: scroll }
        fallbackTween?.kill()
        fallbackTween = gsap.to(proxy, {
          y: bestTop,
          duration: 0.3,
          ease: 'power2.out',
          onUpdate: () => window.scrollTo({ top: proxy.y, behavior: 'instant' }),
        })
      }
      const cancelFallback = () => fallbackTween?.kill()
      window.addEventListener('wheel:settle', onSettle)
      window.addEventListener('wheel', cancelFallback, { passive: true })

      return () => {
        setGlideRedirect(null)
        window.removeEventListener('wheel:settle', onSettle)
        window.removeEventListener('wheel', cancelFallback)
        fallbackTween?.kill()
      }
    })
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="projects" data-section="project-index">
      {projects.map((project, index) => (
        <ProjectIndexItem
          key={project.slug}
          project={project}
          index={index}
          total={projects.length}
        />
      ))}
    </section>
  )
}
