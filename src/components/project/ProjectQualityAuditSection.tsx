import type { Project } from '@/types'

interface ProjectQualityAuditSectionProps {
  project: Project
}

/**
 * QualityAuditSection — per-project validation checklist.
 * The audit rows come straight from project.qualityAudit data; the project's
 * headline stats already live in ProjectOverviewSection, so nothing is
 * hardcoded here.
 */
export default function ProjectQualityAuditSection({ project }: ProjectQualityAuditSectionProps) {
  if (!project.qualityAudit?.length) return null

  return (
    <section className="border-b border-outline py-21" data-section="quality-audit">
      <div className="px-margin-outer">
        <span className="font-label-micro text-label-micro uppercase text-on-surface-variant mb-4 block tracking-widest">
          终审清单 / FINAL CHECK
        </span>
        <h2
          className="font-headline-lg heading-scanlines uppercase tracking-tighter text-on-surface mb-12"
          style={{ fontSize: 'clamp(32px, 5.5vw, 64px)', lineHeight: 1 }}
        >
          QUALITY AUDIT<br /><span className="font-normal">质量核对</span>
        </h2>

        {/* Borderless grid — the row form stays (index + name + note per cell),
            just the outer frame and inner hairlines are dropped; spacing carries
            the separation instead. */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-8" data-reveal>
          {project.qualityAudit.map((row, idx) => (
            <div key={row.item}>
              <span className="font-mono-technical text-mono-technical text-on-surface-variant mr-2">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="font-label-micro text-label-micro uppercase text-on-surface">{row.item}</span>
              <p className="text-body-md text-on-surface-variant leading-relaxed mt-2">{row.note ?? '—'}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
