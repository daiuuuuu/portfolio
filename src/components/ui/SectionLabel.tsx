import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/animations/scrollReveal'
import { cn } from '@/utils/cn'

interface SectionLabelProps {
  index?: string
  label: string
  labelZh?: string
  className?: string
}

/**
 * SectionLabel — terminal ticker-style label above section headings.
 * On entrance, text "glitches" from random block-char noise into legible
 * labels (ScrambleTextPlugin) — a single-frame 1980s terminal nod.
 */
export function SectionLabel({ index, label, labelZh, className }: SectionLabelProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const chars = '█▓▒░▚▞●○'
    gsap.fromTo(
      ref.current!.querySelectorAll('span'),
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.5,
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: 'top 92%' },
      },
    )
    ref.current!.querySelectorAll('span').forEach((span) => {
      gsap.to(span, {
        scrambleText: { text: span.textContent ?? '', chars, speed: 0.4, revealDelay: 0.15 },
        duration: 0.6,
        scrollTrigger: { trigger: ref.current, start: 'top 92%' },
      })
    })
  }, { scope: ref })

  return (
    <div ref={ref} className={cn('flex items-center gap-3 text-label-micro uppercase text-on-surface-variant mb-2', className)}>
      {index && <span className="text-outline">{index}</span>}
      <span>{label}</span>
      {labelZh && <span className="text-on-surface-variant">{labelZh}</span>}
    </div>
  )
}
