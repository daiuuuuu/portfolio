import { Link, useNavigate } from 'react-router-dom'
import { getProjectBySlug } from '@/data/projects'
import { curtainTransition } from '@/animations/curtainTransition'

interface NextProjectSectionProps {
 currentSlug: string
 nextSlug: string
}

/**
 * NextProjectSection — full-width gateway to the next project.
 * Component library ref: 28 · GatewayCTASection (project variant)
 */
export default function NextProjectSection({ nextSlug }: NextProjectSectionProps) {
 const navigate = useNavigate()
 const next = getProjectBySlug(nextSlug)
 if (!next) return null

 const goNext = (e: React.MouseEvent) => {
  e.preventDefault()
  curtainTransition({ path: `/project/${next.slug}`, navigate, label: next.titleEn })
 }

 return (
  <section
   className="py-16"
   data-section="project-next"
   data-animate="project-next"
  >
   <div className="px-margin-outer">
    <p className="text-label-micro uppercase text-on-surface-variant tracking-widest mb-8">
     NEXT PROJECT / 下一个项目
    </p>

    <Link
     to={`/project/${next.slug}`}
     onClick={goNext}
     className="group block border border-outline p-8 md:p-16
           hover:border-secondary cursor-crosshair"
     data-animate="project-next-link"
     data-reveal
    >
     <div className="flex justify-between items-end">
      <div>
       <p className="text-label-micro uppercase text-on-surface-variant mb-3 tracking-widest">
        {next.year} · {next.tags.slice(0, 2).join(' · ')}
       </p>
       <h3
        className="uppercase tracking-tighter leading-none text-on-surface
              group-scanlines-hover"
        style={{ fontSize: 'clamp(28px, 5vw, 72px)', fontWeight: 900, letterSpacing: '-0.04em' }}
       >
        {next.titleEn}
       </h3>
       <p className="text-body-md text-on-surface-variant mt-4 max-w-lg">
        {next.subtitle}
       </p>
      </div>
      <span
       className="text-5xl md:text-8xl text-on-surface group-scanlines-hover
             flex-shrink-0 ml-8 leading-none"
       aria-hidden="true"
      >
       ↗
      </span>
     </div>
    </Link>
   </div>
  </section>
 )
}
