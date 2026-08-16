import { SectionLabel } from '@/components/ui/SectionLabel'
import type { Project } from '@/types'

interface ProjectOverviewSectionProps {
 project: Project
}

/**
 * ProjectOverviewSection — positioning + key stats.
 * Component library ref: 04 · StatsSection + 15 · OverviewPositioning
 */
export default function ProjectOverviewSection({ project }: ProjectOverviewSectionProps) {
 return (
  <section
   className="border-b border-outline py-16"
   data-section="project-overview"
   data-animate="project-overview"
  >
   <div className="px-margin-outer grid-12">
    {/* Overview text — 6 columns */}
    <div className="col-span-12 md:col-span-6 md:border-r md:border-outline md:pr-8" data-reveal>
     <SectionLabel label="OVERVIEW" labelZh="概述" className="mb-6" />
     <p className="text-body-md text-on-surface leading-relaxed mb-4">
      {project.overview.positioning}
     </p>
     <p className="text-body-md text-on-surface-variant leading-relaxed mb-4">
      {project.overview.capability}
     </p>
     <p className="text-body-md text-on-surface-variant leading-relaxed">
      {project.overview.outcome}
     </p>
    </div>

    {/* Stats — 6 columns */}
    <div className="col-span-12 md:col-span-6 pl-0 md:pl-8 mt-8 md:mt-0">
     <div className="grid grid-cols-2 gap-px border border-outline bg-outline">
      {project.stats.map((stat, idx) => (
       <div
        key={stat.label}
        className="bg-surface p-5"
        data-animate="project-stat"
        data-index={idx}
        data-reveal
        data-reveal-group="stats"
       >
        <div
         className="text-on-surface font-black tracking-tighter leading-none mb-1"
         style={{ fontSize: 'clamp(28px, 4.5vw, 52px)' }}
        >
         {stat.value}
         {stat.unit && (
          <span className="text-on-surface-variant text-body-md font-normal ml-1">
           {stat.unit}
          </span>
         )}
        </div>
        <p className="text-label-micro text-on-surface tracking-wider mb-0.5">
         {stat.label}
        </p>
        {stat.desc && (
         <p className="text-[9px] text-on-surface-variant uppercase tracking-widest leading-tight">
          {stat.desc}
         </p>
        )}
       </div>
      ))}
     </div>
    </div>
   </div>
  </section>
 )
}
