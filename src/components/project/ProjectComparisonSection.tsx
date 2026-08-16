import type { Project } from '@/types'

interface ProjectComparisonSectionProps {
  project: Project
}

export default function ProjectComparisonSection({ project }: ProjectComparisonSectionProps) {
  if (!project.methodComparison?.length) return null

  return (
    <section className="py-16">
      <div className="px-margin-outer">
        <span className="font-label-micro text-label-micro uppercase text-on-surface-variant mb-4 block tracking-widest">
          METHOD COMPARISON / 方法对比
        </span>
        <h2
          className="font-headline-lg heading-scanlines uppercase tracking-tighter text-on-surface mb-12"
          style={{ fontSize: 'clamp(32px, 5.5vw, 72px)', lineHeight: 1 }}
        >
          INDUSTRY STANDARD<br />
          <span className="text-on-surface-variant font-normal">vs </span>
          <span className="text-on-surface font-bold">DAIU METHOD</span>
        </h2>

        <div className="space-y-0">
          {project.methodComparison.map((item, idx) => (
            <div key={item.aspect} className={`grid grid-cols-12 gap-gutter border-t border-outline py-10 ${idx === project.methodComparison!.length - 1 ? 'border-b' : ''}`} data-reveal data-reveal-group="method-comparison">
              <div className="col-span-12 md:col-span-2">
                <span className="font-mono-technical text-on-surface-variant uppercase text-[11px]">
                  {String(idx + 1).padStart(2, '0')} · {item.aspect}
                </span>
              </div>

              <div className="col-span-12 md:col-span-4 mt-3 md:mt-0">
                <span className="font-label-micro text-label-micro uppercase text-on-surface-variant mb-2 block tracking-widest">
                  INDUSTRY STANDARD
                </span>
                <p className="text-body-md text-on-surface-variant leading-relaxed">{item.industry}</p>
              </div>

              <div className="col-span-12 md:col-span-4 mt-3 md:mt-0 border-l border-brand-accent pl-6">
                <span className="font-label-micro text-label-micro uppercase text-on-surface-variant mb-2 block tracking-widest">
                  DAIU METHOD
                </span>
                <p className="text-body-md text-on-surface leading-relaxed">{item.ours}</p>
              </div>

              <div className="col-span-12 md:col-span-2 mt-3 md:mt-0">
                <span className="font-label-micro text-label-micro uppercase text-on-surface-variant mb-2 block tracking-widest">
                  WHY IT MATTERS
                </span>
                <p className="text-body-md text-on-surface-variant leading-relaxed">{item.advantage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
