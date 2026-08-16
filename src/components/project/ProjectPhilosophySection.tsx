import type { Project } from '@/types'

interface ProjectPhilosophySectionProps {
  project: Project
}

export default function ProjectPhilosophySection({ project }: ProjectPhilosophySectionProps) {
  if (!project.approach) return null

  return (
    <section className="border-b border-outline py-12" data-section="philosophy">
      <div className="px-margin-outer grid grid-cols-12 gap-gutter">
        <div className={`flex flex-col justify-center ${project.philosophyImage ? 'col-span-8' : 'col-span-12'}`} data-reveal>
          <span className="font-label-micro text-label-micro uppercase text-on-surface-variant mb-3 block">
            DESIGN PHILOSOPHY / 设计理念
          </span>
          <h2
            className="heading-scanlines uppercase tracking-tighter mb-6 text-on-surface"
            style={{ fontSize: 'clamp(28px, 4.5vw, 56px)', lineHeight: 1 }}
          >
            {project.approach.tagline}
          </h2>
          <div className="grid grid-cols-2 gap-4 md:gap-6 border-l border-brand-accent pl-5">
            <p className="text-[13px] leading-relaxed text-on-surface">
              {project.approach.philosophy}
            </p>
            <p className="text-[13px] leading-relaxed text-on-surface-variant">
              {project.approach.philosophyEn}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-1 font-mono-technical text-mono-technical text-on-surface-variant border-t border-outline pt-4">
            <span>FIELD: {project.indexMeta.field}</span>
            <span>SOFTWARE: {project.indexMeta.software}</span>
          </div>
        </div>

        {project.philosophyImage && (
          <div className="col-span-4 flex items-start justify-center">
            <img
              src={project.philosophyImage}
              alt={project.approach?.tagline ?? ''}
              className="w-full object-contain"
              style={{ aspectRatio: '3/4' }}
              data-reveal="cover"
            />
          </div>
        )}
      </div>

      {project.philosophyBanner && (
        <div className="px-0 mt-8">
          <img
            src={project.philosophyBanner}
            alt=""
            className="w-full h-auto"
            data-reveal="cover"
          />
        </div>
      )}
    </section>
  )
}
