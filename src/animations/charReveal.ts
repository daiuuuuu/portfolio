import { gsap } from '@/animations/scrollReveal'

/** ASCII block glyphs used for the per-char glitch (shared: boot overlay + tag). */
export const GLITCH_CHARS = '█▓▒░▚▞'

/**
 * Reveal text character-by-character (boot style): only the current position
 * shows ASCII noise, then flickers to its real glyph; the next character starts
 * only after the previous one is fixed. Left → right, one char at a time.
 *
 * `onProgress` fires with line-equal progress (0..1 across `linesTotal` lines)
 * after each character — used by the boot overlay to drive its ASCII progress bar
 * in lockstep. For a single element call with defaults: `charByChar(tl, el, text)`.
 */
export function charByChar(
  tl: ReturnType<typeof gsap.timeline>,
  el: Element,
  finalText: string,
  onProgress?: (progress: number) => void,
  tick = 0.05,
  lineIndex = 0,
  lineTotal = 1,
  linesTotal = 1,
): void {
  tl.set(el, { textContent: '' })
  const denom = Math.max(1, lineTotal)
  for (let i = 0; i < finalText.length; i++) {
    const prefix = finalText.slice(0, i)
    const ch = finalText[i]
    if (ch === ' ') {
      tl.set(el, { textContent: prefix + ' ' })
    } else {
      // Show ASCII noise at this position, then flicker to the real char.
      tl.set(el, {
        textContent: prefix + GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)],
      })
      tl.to({}, { duration: tick * 0.3 })
      tl.set(el, { textContent: prefix + ch })
    }
    // Advance progress at the exact reveal instant (no trailing-hold lag).
    onProgress?.((lineIndex + (i + 1) / denom) / linesTotal)
    tl.to({}, { duration: tick })
  }
}
