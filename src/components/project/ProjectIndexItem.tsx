import { Link, useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/animations/scrollReveal'
import { curtainTransition } from '@/animations/curtainTransition'
import { Placeholder } from '@/components/ui/Placeholder'
import MarqueeStrip from '@/components/ui/MarqueeStrip'
import type { Project } from '@/types'

interface ProjectIndexItemProps {
 project: Project
 index: number
 total: number
}

interface MetadataProps {
 label: string
 value: string
 desktopOnly?: boolean
}

function Metadata({ label, value, desktopOnly = false }: MetadataProps) {
 return (
  <div className={`font-label-micro text-label-micro text-on-surface uppercase ${desktopOnly ? 'hidden md:block' : ''}`}>
   <span className="text-tertiary block mb-1">{label}</span>
   {value}
  </div>
 )
}

/** A single reusable full-screen record shared by all five projects. */
export default function ProjectIndexItem({ project, index, total }: ProjectIndexItemProps) {
 const displayIndex = String(index + 1).padStart(2, '0')
 const stripDirection = index % 2 === 0 ? 'left' : 'right'
 const navigate = useNavigate()
 // Both entry ports (title text + the inverted big image) go through the
 // brand-purple curtain transition into the detail page.
 const enterProject = () => curtainTransition({
  path: `/project/${project.slug}`,
  navigate,
  label: `${project.titleEn} — NO.${displayIndex}/${String(total).padStart(2, '0')}`,
 })
 const goProject = enterProject
 // Hovering the inverted big image zooms it slightly (the invert already scales
 // it to 1.35; hover adds a little more, back to 1.35 on leave).
 const zoomImg = (scale: number) => {
  if (overlayImgRef.current) gsap.to(overlayImgRef.current, { scale, duration: 0.4, ease: 'power2.out' })
 }

 const articleRef = useRef<HTMLElement>(null)
 const coverRef = useRef<HTMLDivElement>(null)
 const overlayRef = useRef<HTMLDivElement>(null)
 const overlayImgRef = useRef<HTMLImageElement>(null)
 const tlRef = useRef<gsap.core.Timeline | null>(null)
 const hoveringRef = useRef(false)

 useGSAP(() => () => tlRef.current?.kill(), { scope: articleRef })

 /**
  * 负片反转 (docs/动效-目录卡片负片反转.md):
  * hover the cover → a dark circle expands from the image centre over the
  * whole card; inside it, the poster scales to 1.35 while white text
  * cross-fades in. Desktop hover only — touch devices keep the static card.
  */
 const canHover = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

 const invertEnter = () => {
  if (!canHover() || !articleRef.current || !coverRef.current || !overlayRef.current) return
  const ar = articleRef.current.getBoundingClientRect()
  const cr = coverRef.current.getBoundingClientRect()
  const x = ((cr.left + cr.width / 2 - ar.left) / ar.width) * 100
  const y = ((cr.top + cr.height / 2 - ar.top) / ar.height) * 100

  tlRef.current?.kill()
  const texts = overlayRef.current.querySelectorAll('[data-overlay-text]')
  const tl = gsap.timeline()
  tl.fromTo(overlayRef.current,
    { clipPath: `circle(0% at ${x}% ${y}%)` },
    { clipPath: `circle(142% at ${x}% ${y}%)`, duration: 0.55, ease: 'expo.out' })
  if (overlayImgRef.current) {
   tl.fromTo(overlayImgRef.current,
    { scale: 1 },
    { scale: 1.35, duration: 0.5, ease: 'back.out(1.4)' }, 0.15)
  }
  tl.fromTo(texts,
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.3, ease: 'expo.out', stagger: 0.05 }, 0.25)
  tlRef.current = tl
 }

 const invertLeave = () => {
  tlRef.current?.reverse()
 }

 // Hover is tracked so the inverted overlay stays open over EITHER the cover
 // image or the horizontal image+text content, and closes as soon as the mouse
 // leaves the content (or the card) — never stuck until leaving the page.
 const enterAny = () => {
  if (hoveringRef.current) return
  hoveringRef.current = true
  invertEnter()
 }
 const leaveAny = () => {
  if (!hoveringRef.current) return
  hoveringRef.current = false
  invertLeave()
 }

 return (
  <article
   ref={articleRef}
   className="relative min-h-[calc(100vh-4rem)] grid grid-cols-12 gap-gutter border-b border-outline px-margin-outer py-16 md:py-20 overflow-hidden"
   data-project-index={index + 1}
   // Leave the whole card also closes the inverted overlay (fallback).
   onMouseLeave={leaveAny}
  >
   <div className="absolute top-0 left-0 right-0">
    <MarqueeStrip
     text={project.indexMarquee ?? `INDEX OF WORKS — ${project.titleEn} · ${project.year} · NO.${displayIndex}/${String(total).padStart(2, '0')} · `}
     direction={stripDirection}
    />
   </div>

   <aside className="col-span-12 md:col-span-3 flex flex-row md:flex-col justify-between md:justify-center gap-4 border-r border-transparent md:border-surface-variant pr-4 pt-8 md:pt-0" data-reveal>
    <Metadata label="ID / 编号" value={displayIndex} />
    <Metadata label="YEAR / 年份" value={project.year} />
    <Metadata label="FIELD / 领域" value={project.indexMeta.field} />
    <Metadata label="SOFTWARE / 软件" value={project.indexMeta.software} desktopOnly />
    <Metadata label="DIRECTION / 方向" value={project.indexMeta.direction} desktopOnly />
   </aside>

   <div className="col-span-12 md:col-span-5 flex flex-col justify-center pt-6 md:pt-0 min-w-0" data-reveal>
    {project.featured && (
     <span className="self-start font-mono-technical text-[10px] text-brand-accent uppercase tracking-widest border border-brand-accent px-2 py-1 mb-3">
      ★ FEATURED
     </span>
    )}
    <Link
     className="block transition-none"
     to={`/project/${project.slug}`}
     onClick={(e) => { e.preventDefault(); enterProject() }}
    >
     <h3 className="project-index-title text-scanlines uppercase break-words">
      {project.titleEn}
     </h3>
     <p className="project-index-title-zh text-on-surface-variant">
      {project.title}
     </p>
    </Link>

    <p className="font-body-md text-body-md text-on-surface-variant mb-4 max-w-xl leading-relaxed">
     {project.subtitle}
    </p>
    <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-xl leading-relaxed">
     {project.overview.outcome}
    </p>
   </div>


   <div
    ref={coverRef}
    className="col-span-12 md:col-span-4 pt-6 md:pt-0 min-w-0 flex items-center justify-center"
   >
    {project.coverImage ? (
      <img
        src={project.coverImage}
        alt={project.title}
        loading="lazy"
        className="md:w-[320px] w-[200px]"
        data-reveal="cover"
        // Trigger the invert only over the image itself — not the whole grid
        // column, which is wider and caused accidental triggers on approach.
        onMouseEnter={enterAny}
      />
    ) : (
      <div className="w-full" onMouseEnter={enterAny}>
        <Placeholder
          aspect={project.coverAspect}
          label={`${project.slug.toUpperCase()}_VISUAL.raw`}
          className="w-full"
        />
      </div>
    )}
   </div>

   {/* ── 负片反转 overlay: dark layer, clipped to a circle until hover ── */}
   {project.coverImage && (
    <div
     ref={overlayRef}
     className="absolute inset-0 z-20 pointer-events-none"
     style={{ clipPath: 'circle(0% at 50% 50%)' }}
     aria-hidden="true"
    >
     <div className="absolute inset-0 bg-on-surface" />
     {/* Centering wrapper — not interactive (inherits pointer-events:none). */}
     <div className="relative h-full flex items-center justify-center">
      {/* The horizontal image+text content is the interactive zone: clickable to
          open the project, and leaving it (even while still over the black
          backdrop) closes the inverted overlay. */}
      <div
       className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 px-margin-outer pointer-events-auto cursor-pointer"
       onClick={goProject}
       onMouseLeave={leaveAny}
      >
       <img
        ref={overlayImgRef}
        src={project.coverImage}
        alt=""
        className="w-[200px] md:w-[min(34vw,400px)] flex-shrink-0"
        onMouseEnter={() => zoomImg(1.5)}
        onMouseLeave={() => zoomImg(1.35)}
       />
       <div className="max-w-xl text-center md:text-left">
       <p data-overlay-text className="font-mono-technical text-mono-technical text-surface/60 uppercase mb-3">
        {displayIndex} / {String(total).padStart(2, '0')} · {project.year} · {project.indexMeta.field}
       </p>
       <h3 data-overlay-text className="project-index-title text-surface uppercase">
        {project.titleEn}
       </h3>
       <p data-overlay-text className="font-body-md text-body-md text-surface/80 leading-relaxed mb-6">
        {project.overview.outcome}
       </p>
       <p data-overlay-text className="font-mono-technical text-mono-technical text-surface uppercase tracking-widest">
        ENTER PROJECT ↗
       </p>
       </div>
      </div>
     </div>
    </div>
   )}
  </article>
 )
}
