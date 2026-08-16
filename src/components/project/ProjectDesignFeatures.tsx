import type { Project } from '@/types'

interface ProjectDesignFeaturesProps {
  project: Project
}

export default function ProjectDesignFeatures({ project }: ProjectDesignFeaturesProps) {
  if (!project.designFeatures?.length) return null

  return (
    <section className="border-b border-outline py-16" data-section="design-features">
      <div className="px-margin-outer">
        <span className="font-label-micro text-label-micro uppercase text-on-surface-variant mb-2 block tracking-widest">
          DESIGN FEATURES / 设计特点
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-outline border border-outline mt-6">
          {project.designFeatures.map((f, i) => (
            <div key={i} className="bg-surface p-6 flex flex-col" data-reveal data-reveal-group="design-features">
              {/* Number + title */}
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono-technical text-[28px] font-black text-on-surface/15 leading-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-mono-technical text-[11px] text-on-surface font-bold uppercase tracking-wider leading-tight">
                  {f.title}
                </h3>
              </div>

              {/* How it works */}
              <div className="mb-4">
                <span className="font-label-micro text-[9px] uppercase text-on-surface-variant tracking-widest block mb-1.5">
                  HOW IT WORKS
                </span>
                <p className="text-[11px] text-on-surface leading-relaxed">
                  {f.how}
                </p>
              </div>

              {/* Why it matters */}
              <div className="mt-auto border-t border-outline-variant pt-3">
                <span className="font-label-micro text-[9px] uppercase text-on-surface-variant tracking-widest block mb-1">
                  WHY IT MATTERS
                </span>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  {f.why}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
