import type { Project } from '@/types'

interface ProjectDeliveryStructureSectionProps {
  project: Project
}

/**
 * DeliveryStructureSection — the on-disk delivery tree of the project.
 * Rendered as the DirectoryTree component (ref 11): dark on-surface container,
 * mono-technical folder tree (folders end with /, files with extensions).
 * Key deliverables are marked with a leading ★ in the data and render in
 * brand-accent purple — the important files stand out at a glance.
 */
export default function ProjectDeliveryStructureSection({ project }: ProjectDeliveryStructureSectionProps) {
  if (!project.outputStructure?.length) return null

  // Split one tree line into: tree-art prefix + name (+ optional comment).
  // If the name is prefixed with ★, it's a key deliverable → purple.
  const renderLine = (line: string, key: number) => {
    const cIdx = line.search(/[#←(]/)
    const head = cIdx === -1 ? line : line.slice(0, cIdx)
    const comment = cIdx === -1 ? '' : line.slice(cIdx)
    const trimmed = head.trimEnd()
    const prefix = trimmed.match(/^[│├└─\s]*/)?.[0] ?? ''
    const name = trimmed.slice(prefix.length)
    const isKey = name.startsWith('★')
    return (
      <div key={key} className="whitespace-pre">
        {prefix}
        {isKey
          ? <span className="text-[#c4b5fd] font-semibold">{name}</span>
          : name}
        {comment}
      </div>
    )
  }

  return (
    <section className="border-b border-outline py-16" data-section="delivery">
      <div className="px-margin-outer">
        <span className="font-label-micro text-label-micro uppercase text-on-surface-variant mb-4 block tracking-widest">
          DELIVERY STRUCTURE / 交付结构
        </span>
        <h2
          className="font-headline-lg heading-scanlines uppercase tracking-tighter text-on-surface mb-12"
          style={{ fontSize: 'clamp(32px, 5.5vw, 64px)', lineHeight: 1 }}
        >
          OUTPUT TREE<br /><span className="font-normal">交付目录</span>
        </h2>

        {/* DirectoryTree — dark on-surface container, mono tree text. Key
            deliverables (★ in data) render purple. */}
        <div className="bg-on-surface overflow-x-auto" data-reveal>
          <div className="font-mono-technical text-mono-technical text-surface/80 leading-relaxed p-6 md:p-8 text-[11px] md:text-[12px]">
            {project.outputStructure.map(renderLine)}
          </div>
        </div>
      </div>
    </section>
  )
}
