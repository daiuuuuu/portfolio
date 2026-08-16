import type { Project } from '@/types'

interface ProjectStrategySectionProps {
 project: Project
}

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
 PRIMARY: { label: 'PRIMARY',  color: '#2E1065' },
 SECONDARY:{ label: 'SECONDARY', color: '#44474a' },
 REJECTED: { label: 'REJECTED', color: '#ba1a1a' },
 FLAGGED: { label: 'FLAGGED',  color: '#75777a' },
}

/**
 * ProjectStrategySection — component 17 · StrategyComparison
 * 3-card: PRIMARY / REJECTED / FLAGGED
 */
export default function ProjectStrategySection({ project }: ProjectStrategySectionProps) {
 if (!project.strategies?.length) return null

 return (
  <section
   className="border-b border-outline py-16"
   data-section="strategy"
  >
   <div className="px-margin-outer w-full">
    <div className="mb-10" data-reveal>
     <span className="font-label-micro text-label-micro uppercase text-on-surface-variant mb-4 block">
      STRATEGY COMPARISON / 方案对比
     </span>
     <h2
      className="font-headline-lg uppercase tracking-tighter text-on-surface"
      style={{ fontSize: 'clamp(32px, 5vw, 80px)', lineHeight: 1 }}
     >
      DESIGN<br />DECISIONS
     </h2>
    </div>

    <div className={`grid grid-cols-1 border border-outline ${
     project.strategies.length >= 3 ? 'md:grid-cols-3' :
     project.strategies.length === 2 ? 'md:grid-cols-2' : ''
    }`}>
     {project.strategies.map((s, idx) => {
      const style = STATUS_STYLE[s.status] ?? STATUS_STYLE.SECONDARY
      return (
       <div
        key={s.id}
        className="p-8 border-r border-outline last:border-r-0 relative"
        data-index={idx}
        data-reveal
        data-reveal-group="strategy"
       >
        <div className="flex items-start justify-between mb-6">
         <span
          className="font-label-micro text-label-micro uppercase px-2 py-1 border"
          style={{ color: style.color, borderColor: style.color }}
         >
          {style.label}
         </span>
         <span className="font-mono-technical text-mono-technical text-on-surface-variant opacity-40">
          {String(idx + 1).padStart(2, '0')}
         </span>
        </div>
        <h3 className="font-headline-lg-mobile font-bold uppercase mb-4 leading-tight text-on-surface">
         {s.title}
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
         {s.description}
        </p>
        {s.notes && (
         <p className="font-mono-technical text-mono-technical text-on-surface-variant opacity-60 mt-4 border-t border-outline-variant pt-4">
          {s.notes}
         </p>
        )}
       </div>
      )
     })}
    </div>
   </div>
  </section>
 )
}
