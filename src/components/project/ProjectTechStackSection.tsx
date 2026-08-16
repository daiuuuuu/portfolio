import type { Project } from '@/types'

interface ProjectTechStackSectionProps {
  project: Project
}

/**
 * TechStackSection — the technology layers behind the project.
 * A borderless 3-column grid (space-separated, no table lines): each cell
 * pairs a mono-technical layer label with the concrete tech and its purpose.
 */
export default function ProjectTechStackSection({ project }: ProjectTechStackSectionProps) {
  if (!project.techStack?.length) return null

  return (
    <section className="border-b border-outline py-21" data-section="tech-stack">
      <div className="px-margin-outer">
        <span className="font-label-micro text-label-micro uppercase text-on-surface-variant mb-4 block tracking-widest">
          TECH STACK / 技术栈
        </span>
        <h2
          className="font-headline-lg heading-scanlines uppercase tracking-tighter text-on-surface mb-12"
          style={{ fontSize: 'clamp(32px, 5.5vw, 64px)', lineHeight: 1 }}
        >
          TECHNOLOGY<br /><span className="font-normal">技术选型</span>
        </h2>

        {/* Borderless grid — layer label + tech + purpose per cell stays, the
            outer frame and inner hairlines are dropped; spacing carries the
            separation instead. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {project.techStack.map((item) => (
            <div
              key={item.layer}
              data-reveal
              data-reveal-group="tech-stack"
            >
              <p className="font-mono-technical text-[10px] text-brand-accent uppercase tracking-widest mb-2">
                {item.layer}
              </p>
              <p
                className="text-on-surface leading-tight mb-2"
                style={{ fontWeight: 600, fontSize: 'clamp(14px, 1.3vw, 18px)' }}
              >
                {item.tech}
              </p>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                {item.purpose}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
