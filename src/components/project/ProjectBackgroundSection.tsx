import { SectionLabel } from '@/components/ui/SectionLabel'
import type { Project } from '@/types'

interface ProjectBackgroundSectionProps {
 project: Project
}

/**
 * ProjectBackgroundSection — context + numbered pain points + goal.
 * Component library ref: 16 · PainPointsTargetVector
 */
export default function ProjectBackgroundSection({ project }: ProjectBackgroundSectionProps) {
 const { background } = project

 return (
  <section
   className="border-b border-outline py-16"
   data-section="project-background"
   data-animate="project-background"
  >
   <div className="px-margin-outer">
    <SectionLabel label="BACKGROUND" labelZh="背景与痛点" className="mb-8" />

    <div className="grid-12">
     {/* Context — 5 columns */}
     <div className="col-span-12 md:col-span-5 md:border-r md:border-outline md:pr-8" data-reveal>
      <p className="text-label-micro uppercase text-on-surface-variant mb-3">CONTEXT / 背景</p>
      <p className="text-body-md text-on-surface leading-relaxed">{background.context}</p>

      <div className="mt-8 border-t border-outline pt-6">
       <p className="text-label-micro uppercase text-on-surface-variant mb-3">GOAL / 目标</p>
       <p className="text-body-md text-on-surface leading-relaxed">{background.goal}</p>
      </div>
     </div>

     {/* Pain points — 7 columns */}
     <div className="col-span-12 md:col-span-7 pl-0 md:pl-8 mt-8 md:mt-0">
      <p className="text-label-micro uppercase text-on-surface-variant mb-6">
       PAIN POINTS / 核心痛点
      </p>
      <div className="space-y-0">
       {background.painPoints.map((point, idx) => (
        <div
         key={point.label}
         className="border-b border-outline-variant py-5 flex gap-6"
         data-animate="project-pain-point"
         data-index={idx}
         data-reveal
         data-reveal-group="pain-points"
        >
         <span className="text-mono-technical text-on-surface-variant flex-shrink-0 w-8">
          {String(idx + 1).padStart(2, '0')}
         </span>
         <div>
          <p className="text-body-md font-semibold text-on-surface mb-1">{point.label}</p>
          <p className="text-body-md text-on-surface-variant">{point.detail}</p>
         </div>
        </div>
       ))}
      </div>
     </div>
    </div>
   </div>
  </section>
 )
}
