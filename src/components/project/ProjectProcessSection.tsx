import { SectionLabel } from '@/components/ui/SectionLabel'
import type { Project } from '@/types'

interface ProjectProcessSectionProps {
 project: Project
}

/**
 * ProjectProcessSection — pipeline / workflow steps.
 * Component library ref: 05 · AgentPipelineCards + 06 · WorkflowVisualization
 * Design: 3-to-N column card grid, watermark phase numbers, status badge.
 */
export default function ProjectProcessSection({ project }: ProjectProcessSectionProps) {
 const { process } = project
 const colClass = process.length <= 3
  ? 'md:grid-cols-3'
  : process.length <= 4
   ? 'md:grid-cols-4'
   : 'md:grid-cols-3 lg:grid-cols-5'

 return (
  <section
   className="border-b border-outline py-16"
   data-section="project-process"
   data-animate="project-process"
  >
   <div className="px-margin-outer">
    <SectionLabel label="PROCESS" labelZh="流程架构" className="mb-8" />

    <div className={`grid grid-cols-1 ${colClass} border border-outline`}>
     {process.map((step, idx) => (
      <div
       key={step.id}
       className="p-6 border-r border-outline last:border-r-0 relative group overflow-hidden"
       data-animate="project-process-step"
       data-index={idx}
       data-reveal
       data-reveal-group="process-steps"
      >
       {/* Watermark phase */}
       <span
        className="absolute top-0 right-0 p-3 text-mono-technical
              text-on-surface-variant opacity-20 select-none"
        aria-hidden="true"
       >
        {step.id}
       </span>

       {/* Phase label */}
       <p className="text-label-micro uppercase text-on-surface-variant mb-4 tracking-widest">
        {step.phase}
       </p>

       {/* Step name */}
       <h4 className="text-headline-lg-mobile font-bold uppercase mb-3 leading-tight">
        {step.label}
       </h4>

       <p className="text-body-md text-on-surface-variant leading-relaxed mb-4">
        {step.description}
       </p>

       {/* Status badge */}
       <span
        className={`text-label-micro uppercase px-2 py-0.5 border ${
         step.status === 'completed'
          ? 'text-on-surface-variant border-on-surface-variant'
          : 'text-on-surface-variant border-outline-variant'
        }`}
       >
        {step.status === 'completed' ? '✓ DONE' : 'PLANNED'}
       </span>
      </div>
     ))}
    </div>
   </div>
  </section>
 )
}
