import { useRef, useEffect, useState } from 'react'
import type { Project } from '@/types'

interface ProjectDecisionsSectionProps {
  project: Project
}

export default function ProjectDecisionsSection({ project }: ProjectDecisionsSectionProps) {
  const questionRefs = useRef<(HTMLHeadingElement | null)[]>([])
  const [leftWidth, setLeftWidth] = useState(400)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!isDesktop) return
    const widths = questionRefs.current
      .filter(Boolean)
      .map(el => el!.scrollWidth)
    if (widths.length > 0) {
      const max = Math.max(...widths)
      setLeftWidth(Math.max(200, Math.min(520, max + 64)))
    }
  }, [project.decisions, isDesktop])

  if (!project.decisions.length) return null

  return (
    <section className="border-y border-outline py-16" data-section="project-decisions">
      <div className="px-margin-outer">
        <div className="space-y-0">
          {project.decisions.map((decision, idx) => (
            <div key={decision.id} className="border-b border-outline-variant py-8 flex flex-col md:flex-row" data-reveal data-reveal-group="decisions">
              <div className="md:pr-8 flex-shrink-0" style={isDesktop ? { width: leftWidth } : undefined}>
                <p className="text-label-micro uppercase text-on-surface-variant mb-3 tracking-widest">
                  {decision.id}
                </p>
                <h4
                  ref={el => { questionRefs.current[idx] = el }}
                  className="font-normal leading-tight text-on-surface md:whitespace-nowrap"
                  style={{ fontSize: '22px', fontWeight: 400 }}
                >
                  {decision.question}
                </h4>
              </div>

              <div className="flex-1 min-w-0 mt-4 md:mt-0 border-l border-outline pl-8">
                <p className="text-body-md text-on-surface mb-3">
                  → {decision.answer}
                </p>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  {decision.rationale}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
