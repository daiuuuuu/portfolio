import type { Project } from '@/types'

interface ProjectEngineeringHighlightsSectionProps {
  project: Project
}

/**
 * EngineeringHighlightsSection — the hard technical wins behind each project.
 * Numbered rows on the 3/9 grid: mono index + feature name left, the detail
 * right, hairline-separated — the same rhythm as Experience responsibilities.
 */
export default function ProjectEngineeringHighlightsSection({ project }: ProjectEngineeringHighlightsSectionProps) {
  if (!project.engineeringHighlights?.length) return null

  return (
    <section className="border-b border-outline py-16" data-section="engineering">
      <div className="px-margin-outer">
        <span className="font-label-micro text-label-micro uppercase text-on-surface-variant mb-4 block tracking-widest">
          ENGINEERING HIGHLIGHTS / 工程亮点
        </span>
        <h2
          className="font-headline-lg heading-scanlines uppercase tracking-tighter text-on-surface mb-12"
          style={{ fontSize: 'clamp(32px, 5.5vw, 64px)', lineHeight: 1 }}
        >
          ENGINEERING<br /><span className="font-normal">工程实现</span>
        </h2>

        <div className="border-t border-outline">
          {project.engineeringHighlights.map((item, idx) => (
            <div
              key={item.label}
              className="grid grid-cols-12 gap-gutter border-b border-outline py-6 md:py-8"
              data-reveal
              data-reveal-group="engineering"
            >
              <div className="col-span-12 md:col-span-3 flex items-baseline gap-4 pr-6">
                <span className="font-mono-technical text-[11px] text-brand-accent leading-none">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span
                  className="text-on-surface uppercase tracking-tight leading-snug"
                  style={{ fontWeight: 600, fontSize: 'clamp(14px, 1.3vw, 19px)' }}
                >
                  {item.label}
                </span>
              </div>
              <div className="col-span-12 md:col-span-9 md:border-l md:border-outline-variant md:pl-8 mt-3 md:mt-0">
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
