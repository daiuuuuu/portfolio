import { useLayoutEffect, useRef } from 'react'
import { registerCurtain } from '@/animations/curtainTransition'

// Five full-screen violet sheets, stacked dark → light → brand (top).
// All shades stay clearly in the brand-purple hue family (derived from
// #2E1065) — no black/gray tones — so the exposed left-edge cascade reads as a
// clean purple ramp. They sweep in staggered (each chasing the next) and settle
// offset so their left edges show the layered cascade.
const SHEETS = ['#240b4f', '#2E1065', '#4d2085', '#7a4bb5', '#2E1065']

/**
 * The catalog→detail curtain: five stacked full-screen colour sheets that sweep
 * right → left in a staggered "chase" (each starts just after the previous, so
 * they never move in sync), then settle with their left edges peeking out as a
 * layered violet cascade. Dressed with a faint CRT-scanline texture and a
 * mono-technical project label. Offscreen by default (set before first paint);
 * `pointer-events: none` so it never blocks interaction.
 */
export default function CurtainOverlay() {
  const sheetsRef = useRef<(HTMLDivElement | null)[]>([])
  const labelRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    registerCurtain({
      sheets: sheetsRef.current.filter((el): el is HTMLDivElement => el !== null),
      label: labelRef.current,
    })
  }, [])

  return (
    <div data-curtain-overlay className="fixed inset-0 z-[110] pointer-events-none overflow-hidden" aria-hidden="true">
      {SHEETS.map((color, i) => (
        <div
          key={i}
          ref={(el) => { sheetsRef.current[i] = el }}
          data-curtain
          data-curtain-index={i}
          className="absolute top-0 bottom-0 left-0 w-screen will-change-transform"
          style={{ backgroundColor: color }}
        />
      ))}

      {/* Faint CRT scanlines over the whole stack. */}
      <div className="absolute inset-0 curtain-texture" />

      {/* Project label — fixed, independent of the sheets: fades in over the
          covered screen, fades out when the sheets exit. Never slides. */}
      <div ref={labelRef} className="absolute bottom-10 right-10 opacity-0 text-right">
        <p className="font-mono-technical text-[10px] text-surface/50 uppercase tracking-[0.3em] mb-2">
          ENTERING / 进入项目
        </p>
        <p
          data-curtain-label
          className="font-mono-technical text-mono-technical text-surface/90 uppercase tracking-[0.15em]"
        />
      </div>
    </div>
  )
}
