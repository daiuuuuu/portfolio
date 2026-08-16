import type { Project } from '@/types'

interface ProjectModuleDetailsSectionProps {
  project: Project
}

/**
 * ModuleDetailsSection — deep dive into the key modules/techniques.
 * Bordered boxes, each a mono index + title + the how-it-works description
 * (and inline code when present). Renders only for projects that ship
 * moduleDetails (guji, video-factory, image-workflow, portfolio).
 */
export default function ProjectModuleDetailsSection({ project }: ProjectModuleDetailsSectionProps) {
  if (!project.moduleDetails?.length) return null

  return (
    <section className="border-b border-outline py-16" data-section="modules">
      <div className="px-margin-outer">
        <span className="font-label-micro text-label-micro uppercase text-on-surface-variant mb-4 block tracking-widest">
          MODULE DETAILS / 模块解析
        </span>
        <h2
          className="font-headline-lg heading-scanlines uppercase tracking-tighter text-on-surface mb-12"
          style={{ fontSize: 'clamp(32px, 5.5vw, 64px)', lineHeight: 1 }}
        >
          DEEP DIVE<br /><span className="font-normal">模块原理</span>
        </h2>

        <div className="space-y-6">
          {project.moduleDetails.map((m, idx) => (
            <div
              key={m.title}
              className="border border-outline p-6 md:p-8"
              data-reveal
              data-reveal-group="modules"
            >
              <p className="font-mono-technical text-[10px] text-brand-accent uppercase tracking-widest mb-3">
                {String(idx + 1).padStart(2, '0')} / MODULE
              </p>
              <h3
                className="text-on-surface uppercase tracking-tight mb-3"
                style={{ fontWeight: 700, fontSize: 'clamp(17px, 2vw, 26px)' }}
              >
                {m.title}
              </h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                {m.description}
              </p>
              {m.code && (
                <pre className="mt-5 border-t border-outline pt-4 font-mono-technical text-mono-technical text-on-surface-variant leading-relaxed whitespace-pre overflow-x-auto">
                  {m.code}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
