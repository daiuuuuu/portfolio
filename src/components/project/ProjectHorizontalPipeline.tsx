import type { Project } from '@/types'

interface ProjectHorizontalPipelineProps {
 project: Project
}

/**
 * ProjectHorizontalPipeline — component 23 · HorizontalAgentPipeline
 * Colored strips left per agent, vertical text, 3-row horizontal layout
 */
export default function ProjectHorizontalPipeline({ project }: ProjectHorizontalPipelineProps) {
 const steps = project.process.slice(0, 3)
 if (steps.length < 2) return null

 const STRIP_COLORS = ['bg-secondary text-surface', 'bg-on-surface text-surface', 'bg-primary text-surface']

 return (
  <section
   className="border-b border-outline py-16"
   data-section="horizontal-pipeline"
  >
   <div className="px-margin-outer w-full">
    <div className="mb-10" data-reveal>
     <h2
      className="font-headline-lg tracking-tighter text-on-surface uppercase"
      style={{ fontSize: 'clamp(32px, 5.5vw, 64px)', lineHeight: 1 }}
     >
      PIPELINE_ARCHITECTURE
     </h2>
    </div>

    <div className="flex flex-col md:flex-row border border-outline">
     {steps.map((step, idx) => (
      <div
       key={step.id}
       className="flex-1 flex flex-row border-b md:border-b-0 border-r border-outline last:border-r-0 hover:bg-surface-container-high transition-none group"
       data-reveal
       data-reveal-group="pipeline-cards"
      >
       <div className={`w-10 border-r border-outline flex items-center justify-center py-4 ${STRIP_COLORS[idx % STRIP_COLORS.length]}`}>
        <span
         className="font-label-micro text-label-micro uppercase tracking-widest text-[9px]"
         style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
         {step.phase.replace(' ', '_')}_{String(idx + 1).padStart(2, '0')}
        </span>
       </div>
       <div className="p-6 flex flex-col gap-4 flex-1">
        {/* Mono step marker replaces the Material Symbols icon (that font was a
            Google-Fonts CDN dependency — blocked in China; self-hosted fonts only). */}
        <span className="font-mono-technical text-3xl font-black text-on-surface-variant leading-none">
         {String(idx + 1).padStart(2, '0')}
        </span>
        <div>
         <p className="font-label-micro uppercase text-on-surface-variant mb-1">{step.phase}</p>
         <h4 className="font-headline-lg-mobile text-xl font-bold uppercase mb-2 text-on-surface">
          {step.label}
         </h4>
         <p className="font-body-md text-body-md text-on-surface-variant">
          {step.description}
         </p>
        </div>
        {step.stat && (
         <div className="font-mono-technical text-mono-technical text-on-surface-variant mt-auto pt-4 border-t border-outline-variant">
          {step.stat}
         </div>
        )}
       </div>
      </div>
     ))}
    </div>
   </div>
  </section>
 )
}
