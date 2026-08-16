import type { Project } from '@/types'

interface Props { project: Project }

export default function ProjectWorkflowCompareSection({ project }: Props) {
  if (!project.workflowComparison?.length) return null

  const totalRow = project.workflowComparison[project.workflowComparison.length - 1]
  const rows = totalRow?.stage === '总计' ? project.workflowComparison.slice(0, -1) : project.workflowComparison

  return (
    <section className="border-b border-outline py-8">
      <div className="px-margin-outer">
        <span className="font-label-micro text-label-micro uppercase text-on-surface-variant mb-2 block tracking-widest">
          WORKFLOW COMPARISON / 流程对比
        </span>
        <h2 className="font-headline-lg heading-scanlines uppercase tracking-tighter text-on-surface mb-6"
          style={{ fontSize: 'clamp(32px, 5vw, 64px)', lineHeight: 1 }}>
          EFFICIENCY<br />COMPRESSION
        </h2>

        {/* Stage-by-stage comparison */}
        <div className="border border-outline" data-reveal>
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-12 border-b border-outline-variant last:border-b-0 hover:bg-surface-container-low transition-none">
              <div className="col-span-12 md:col-span-3 border-r border-outline-variant p-3 flex items-center">
                <span className="font-label-micro uppercase text-on-surface tracking-widest">{row.stage}</span>
              </div>
              <div className="col-span-6 md:col-span-4 border-r border-outline-variant p-3 flex flex-col justify-center">
                <span className="font-label-micro text-label-micro uppercase text-on-surface-variant mb-0.5 tracking-widest">TRADITIONAL</span>
                <span className="text-body-md text-on-surface-variant">{row.traditional}</span>
              </div>
              <div className="col-span-6 md:col-span-5 p-3 flex flex-col justify-center bg-surface-container-low">
                <span className="font-label-micro text-label-micro uppercase text-on-surface mb-0.5 tracking-widest">AUTOMATED</span>
                <span className="text-body-md text-on-surface font-medium">{row.automated}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total bar */}
        {totalRow && totalRow.stage === '总计' && (
          <div className="mt-0 border border-outline border-t-0 bg-on-surface">
            <div className="grid grid-cols-12">
              <div className="col-span-12 md:col-span-3 p-3 flex items-center">
                <span className="font-label-micro uppercase text-surface tracking-widest">TOTAL</span>
              </div>
              <div className="col-span-6 md:col-span-4 p-3 flex flex-col justify-center">
                <span className="text-body-md text-surface/70">{totalRow.traditional}</span>
              </div>
              <div className="col-span-6 md:col-span-5 p-3 flex flex-col justify-center">
                <span className="text-body-md text-surface font-bold">{totalRow.automated}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
