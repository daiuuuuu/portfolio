import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/animations/scrollReveal'
import { Badge } from '@/components/ui/Badge'
import { Placeholder } from '@/components/ui/Placeholder'
import type { Project } from '@/types'

interface ProjectHeroProps {
 project: Project
}

/**
 * ProjectHero — full-screen opening section.
 * Left: text content vertically centered. Right: cover image fills full height edge-to-edge.
 * Load intro (not scroll-driven): title → tags → subtitle → meta, cover unveils top-down.
 */
export default function ProjectHero({ project }: ProjectHeroProps) {
 const rootRef = useRef<HTMLElement>(null)

 useGSAP(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const q = gsap.utils.selector(rootRef)
  // Hide up front (.set, not .from) so the hidden state holds while the
  // timeline waits for the curtain to part (catalog→detail transition).
  gsap.set(q('[data-animate="project-hero-title"]'), { y: 48, opacity: 0 })
  gsap.set(q('[data-animate="project-hero-tags"]'), { y: 20, opacity: 0 })
  gsap.set(q('[data-animate="project-hero-subtitle"]'), { y: 20, opacity: 0 })
  gsap.set(q('[data-animate="project-hero-meta"]'), { y: 16, opacity: 0 })
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, paused: true })
  // Cover image is shown statically (no top-down clip reveal).
  tl.to(q('[data-animate="project-hero-title"]'), { y: 0, opacity: 1, duration: 0.9 }, 0)
   .to(q('[data-animate="project-hero-tags"]'), { y: 0, opacity: 1, duration: 0.5 }, 0.55)
   .to(q('[data-animate="project-hero-subtitle"]'), { y: 0, opacity: 1, duration: 0.5 }, 0.7)
   .to(q('[data-animate="project-hero-meta"]'), { y: 0, opacity: 1, duration: 0.5 }, 0.85)
  const play = () => tl.play()
  // Entered via the curtain: the text assembles as the panels part, not while
  // the page is still covered.
  if (document.body.classList.contains('curtain-active')) {
   const onEnd = () => {
    window.removeEventListener('transition:curtain-end', onEnd)
    play()
   }
   window.addEventListener('transition:curtain-end', onEnd)
   return () => {
    window.removeEventListener('transition:curtain-end', onEnd)
    tl.kill()
   }
  }
  play()
  return () => { tl.kill() }
 }, { scope: rootRef, dependencies: [project.slug], revertOnUpdate: true })

 return (
  <section
   ref={rootRef}
   className="border-b border-outline grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[calc(100vh-4rem)]"
   data-section="project-hero"
   data-animate="project-hero"
  >
   {/* ── Left: text content ──────────────────────────────── */}
   <div className="p-margin-outer flex flex-col justify-end py-12 border-r border-outline relative">
    {/* ── English + Chinese titles: centered together ─────── */}
    <div className="absolute top-[35%] right-4 left-4 z-10 max-md:overflow-hidden" data-animate="project-hero-title">
      <h1
        className="block uppercase font-black whitespace-nowrap text-letterpress"
        style={{ fontFamily: 'Geologica, Inter, sans-serif', fontSize: project.titleFontSize || 'clamp(52px, 7vw, 120px)', letterSpacing: '-0.03em', lineHeight: 0.85, color: '#1c1c1c' }}
      >
        {project.titleEn}
      </h1>
      <p
        className="text-on-surface-variant mt-4 ml-4"
        style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}
      >
        {project.title}
      </p>
    </div>

    {/* ── Bottom block: tags + subtitle + meta ─────────────── */}
    <div>
     <div className="flex flex-wrap gap-2 mb-6" data-animate="project-hero-tags">
      {project.tags.map(tag => (
       <Badge key={tag} variant="outline">{tag}</Badge>
      ))}
     </div>

     <p className="text-body-md text-on-surface-variant max-w-xl mb-8" data-animate="project-hero-subtitle">
      {project.subtitle}
     </p>

     <div
      className="flex flex-wrap gap-8 text-mono-technical text-on-surface-variant border-t border-outline-variant pt-6"
      data-animate="project-hero-meta"
     >
      <div>
       <span className="text-label-micro uppercase text-on-surface-variant block mb-1">PERIOD</span>
       {project.period}
      </div>
      <div>
       <span className="text-label-micro uppercase text-on-surface-variant block mb-1">YEAR</span>
       {project.year}
      </div>
      <div>
       <span className="text-label-micro uppercase text-on-surface-variant block mb-1">STACK</span>
      {project.tags.slice(0, 3).join(' · ')}
     </div>
    </div>
    </div>
   </div>

   {/* ── Right: cover image, full height, edge-to-edge ───── */}
   <div className="relative overflow-hidden" data-animate="project-hero-image">
    {project.coverImage
     ? <img
       src={project.coverImage}
       alt={project.title}
       className="absolute inset-0 w-full h-full object-cover"
      />
     : <Placeholder
       aspect="auto"
       label={`${project.slug.toUpperCase()}_COVER.raw`}
       className="w-full min-h-[280px]"
      />
    }
    {project.coverImage && (
      <div className="absolute top-6 left-6 bg-on-surface text-surface px-3 py-1 text-mono-technical uppercase z-10">
       {project.year}
      </div>
    )}
   </div>
  </section>
 )
}
