import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/animations/scrollReveal'


function SchemeFrame({ src, title, label, desc, colors, delay = 1600 }: { src: string; title: string; label: string; desc: string; colors: string[]; delay?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.3)
  // The scheme document is a full HTML file (heavy to parse). Loading it at
  // mount blocked the curtain transition, and loading it when scrolled near
  // blocked the wheel (freezing the page mid-scroll). So load it during page
  // IDLE, staggered per instance — by the time a reader scrolls down to it,
  // it's already ready. The IntersectionObserver stays as a fallback for fast
  // scrollers who reach the frame before the idle timer fires.
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setScale(containerRef.current.offsetWidth / 1920)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  // Load the heavy scheme document during a window that is hidden from the user
  // (so the parse never blocks the wheel or the curtain reveal):
  //  • entered via the curtain → the page mounts mid-transition, behind the
  //    covered sheet — load immediately, hidden by the sheet's covered hold;
  //  • direct load → the boot covers the screen for ~1.3s — a slightly later
  //    idle load is hidden behind it.
  // Either way, by the time the reader scrolls down to the frame (~3400px in)
  // it is already loaded.
  useEffect(() => {
    const base = document.body.classList.contains('curtain-active') ? 0 : 300
    const idleTimer = window.setTimeout(() => setLoaded(true), base + delay)
    return () => window.clearTimeout(idleTimer)
  }, [delay])

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-0 pb-32 last:pb-0" data-reveal>
      <div className="md:col-span-5 mr-4">
        <div className="overflow-hidden">
          <div className="flex items-center justify-between px-2 py-1.5 bg-surface">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="font-mono-technical text-[8px] text-on-surface-variant ml-2 uppercase tracking-widest">{label}</span>
            </div>
            <button
              onClick={() => {
                const iframe = document.querySelector(`iframe[title="${title}"]`) as HTMLIFrameElement | null
                // eslint-disable-next-line no-self-assign
                if (iframe) iframe.src = iframe.src
              }}
              className="font-mono-technical text-[8px] text-on-surface-variant hover:text-on-surface uppercase tracking-widest"
            >
              ↻ RELOAD
            </button>
          </div>
          <div ref={containerRef} className="relative w-full overflow-hidden" style={{ paddingBottom: "56.25%", height: 0 }}>
            <iframe
              src={loaded ? src : undefined}
              title={title}
              className="absolute top-0 left-0 border-none"
              style={{ width: "1920px", height: "1080px", transform: `scale(${scale})`, transformOrigin: "top left" }}
              onLoad={(e) => {
                try {
                  const doc = (e.target as HTMLIFrameElement).contentDocument
                  if (doc) {
                    const style = doc.createElement("style")
                    style.textContent = "::-webkit-scrollbar{display:none}*{scrollbar-width:none;cursor:crosshair!important}body,html,a,button{cursor:crosshair!important}"
                    doc.head.appendChild(style)
                  }
                } catch { /* cross-origin iframe — can't inject styles */ }
              }}
            />
            <div className="absolute top-0 left-0 right-0" style={{ height: "7%" }} />
          </div>
        </div>
      </div>
      <div className="md:col-span-6 md:col-start-7 flex flex-col justify-between pt-2 pl-8">
        <div>
          <span className="font-mono-technical text-mono-technical text-on-surface-variant mb-2 block">{label}</span>
          <h3 className="font-headline-lg-mobile font-bold uppercase text-on-surface mb-3">{title}</h3>
          <p className="text-body-md text-on-surface-variant leading-relaxed mb-4">{desc}</p>
          <div className="flex gap-px h-16 mb-4 max-w-[280px]">
            {colors.map((c, i) => {
              const widths = ["40%", "25%", "15%", "10%", "10%"]
              return (
                <div key={c} className="flex flex-col" style={{ width: widths[i] }}>
                  <div className="flex-1" style={{ backgroundColor: c }} />
                  <p className="font-mono-technical text-[8px] text-on-surface-variant mt-1 leading-tight truncate">{c}</p>
                </div>
              )
            })}
          </div>
        </div>
        <a href={src} target="_blank" rel="noopener noreferrer"
          className="font-label-micro text-label-micro uppercase tracking-widest px-6 py-3 border border-outline text-on-surface hover:bg-on-surface hover:text-surface transition-none">
          OPEN IN NEW TAB ↗
        </a>
      </div>
    </div>
  )
}

const DUANFU_SCHEMES = [
  { src: "/portfolio/projects/duanfu/scheme-1.html", label: "PRIMARY", title: "Swiss International",
    desc: "主推方案。黑白极简，12列网格，无圆角。含16个JS交互模块，1315行代码，WCAG AA合规。Canvas粒子开屏动画、localStorage主题切换、模态弹窗focus陷阱、三级响应式断点。品牌匹配度最高，差异化最强。",
    colors: ["#0D0D0D","#F5F5F5","#EBEBEB","#555555","#777777"] },
  { src: "/portfolio/projects/duanfu/scheme-2.html", label: "SECONDARY", title: "Modern Editorial",
    desc: "备选方案。暖橙强调色搭配Noto Serif SC衬线体，编辑级排版质感。毛玻璃导航、28px点状网格背景纹理、流体clamp响应式字号。356行代码，覆盖基础交互。适合偏好编辑质感的客户。",
    colors: ["#B85C38","#FAF7F2","#2C2C2C","#8B7355","#D4A574"] },
  { src: "/portfolio/projects/duanfu/scheme-3.html", label: "FLAGGED", title: "Dark Tech",
    desc: "探索方案。深蓝强调色+四层灰度纵深背景，径向渐变光晕营造空间深度。圆角卡片体系(6-16px)，610行代码。存在P1对比度问题，不建议直接交付，适合作为风格参考。",
    colors: ["#1E3A5F","#0F1923","#162231","#2A4A7F","#3A6EA5"] },
]

export function DuanfuShowcase() {
  return (
    <div className="mt-10 pt-8 border-t border-outline-variant px-margin-outer">
      <p className="font-label-micro text-label-micro uppercase text-on-surface-variant mb-6 tracking-widest">
        VISUAL SHOWCASE · 三方案实时预览
      </p>
      <div className="flex flex-col">
        {DUANFU_SCHEMES.map((s, si) => (
          <SchemeFrame key={s.label} src={s.src} title={s.title} label={s.label} desc={s.desc} colors={s.colors} delay={si * 120} />
        ))}
      </div>
    </div>
  )
}

const XCU_IMAGES = [
  { src: '/portfolio/images/科技园-三折页正面设计稿.webp', alt: '科技园三折页正面设计稿' },
  { src: '/portfolio/images/科技园-三折页反面设计稿.png', alt: '科技园三折页反面设计稿' },
  { src: '/portfolio/images/科技园-竞赛大屏亮色版.png', alt: '科技园竞赛大屏亮色版' },
  { src: '/portfolio/images/科技园-竞赛大屏暗色版.png', alt: '科技园竞赛大屏暗色版' },
  { src: '/portfolio/images/科技园-就业指导展板.png', alt: '科技园就业指导展板' },
]

export function XcuShowcase() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const section = sectionRef.current
    if (!section) return
    const track = section.querySelector<HTMLElement>('[data-animate="horizontal-scroll-track"]')
    const strip = section.querySelector<HTMLElement>('[data-animate="horizontal-scroll-strip"]')
    if (!track || !strip) return

    // Desktop only: pin ONLY the horizontal-scroll track and map vertical scroll
    // to horizontal drift. The trigger is the track, NOT the whole section —
    // after the design-spec block was added above, pinning the section pinned
    // the spec + the strip together, pushing the strip off-screen and misplacing
    // its geometry. Mobile keeps native touch scrolling on the (un-pinned) strip.
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px)', () => {
      const distance = () => Math.max(0, strip.scrollWidth - track.clientWidth)
      gsap.to(strip, {
        x: () => -distance(),
        ease: 'none', // required: 1:1 scroll↔position mapping
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
    })

    // Strip images are lazy-loaded; their widths decide the travel distance,
    // so recalculate once each finishes loading.
    const imgs = Array.from(strip.querySelectorAll('img'))
    const onLoad = () => ScrollTrigger.refresh()
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener('load', onLoad, { once: true })
    })
    return () => {
      mm.revert()
      imgs.forEach((img) => img.removeEventListener('load', onLoad))
    }
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      className="border-t border-outline-variant"
      data-section="xcu-showcase"
      data-animate="horizontal-scroll"
    >
      {/* Label */}
      <div className="px-margin-outer pt-8 pb-4">
        <p className="font-label-micro text-label-micro uppercase text-on-surface-variant tracking-widest">
          VISUAL SHOWCASE · 多场景物料矩阵
        </p>
      </div>

      {/* ══ DESIGN SPEC · AI 设计规范提取 ══ */}
      <div className="px-margin-outer pt-6 pb-8 border-b border-outline-variant" data-reveal>
        <p className="font-label-micro text-label-micro uppercase text-brand-accent tracking-widest mb-1">
          DESIGN SPEC · AI 设计规范提取
        </p>
        <p className="font-mono-technical text-[10px] text-on-surface-variant uppercase tracking-widest mb-8">
          VIS PDF → AI 逐页提取 → 可编程设计 TOKEN
        </p>

        <div className="flex items-stretch gap-2 font-mono-technical text-[10px] text-on-surface mb-10">
          <span className="border border-outline px-3 py-2">VIS PDF<br/><span className="text-on-surface-variant">47 页</span></span>
          <span className="text-brand-accent self-center">→</span>
          <span className="border border-outline px-3 py-2">AI 逐页分析<br/><span className="text-on-surface-variant">Qwen-VL</span></span>
          <span className="text-brand-accent self-center">→</span>
          <span className="bg-brand-accent text-surface px-3 py-2">设计 TOKEN<br/><span className="text-surface/60">可编程</span></span>
          <span className="self-center text-on-surface-variant ml-2">· 颜色精确到 hex · 字体精确到 family · 改一处全量级联</span>
        </div>

        {/* ── 01 LOGO SYSTEM ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          <div className="md:col-span-5">
            <p className="font-label-micro text-label-micro uppercase text-on-surface-variant tracking-widest mb-3">
              01 · LOGO SYSTEM / 标志系统
            </p>
            <div className="bg-white border border-outline-variant p-10 flex items-center justify-center mb-3">
              <img src="/portfolio/images/科技园-logo.png" alt="许昌大学科技园 logo" className="w-24 h-24" />
            </div>
            <p className="font-mono-technical text-[9px] text-on-surface-variant tracking-widest">
              五条水平线 · 上浅下深 · 波浪收尾 · 负形设计 · 象征"莲城"水系
            </p>
          </div>
          <div className="md:col-span-7">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="border border-outline-variant p-5">
                <div className="border border-dashed border-brand-accent p-4 inline-block"><img src="/portfolio/images/科技园-logo.png" alt="" className="w-12 h-12" /></div>
                <p className="font-mono-technical text-[9px] text-on-surface-variant mt-3">安全空间 · 四周留白 ≥ 0.5× 高</p>
              </div>
              <div className="border border-outline-variant p-5 flex flex-col justify-between">
                <div className="flex items-end gap-4"><img src="/portfolio/images/科技园-logo.png" alt="" className="w-6 h-6" /><img src="/portfolio/images/科技园-logo.png" alt="" className="w-10 h-10" /><img src="/portfolio/images/科技园-logo.png" alt="" className="w-16 h-16" /></div>
                <p className="font-mono-technical text-[9px] text-on-surface-variant mt-3">最小尺寸 · 印刷 ≥12mm / 屏幕 ≥24px</p>
              </div>
            </div>
            <div className="border border-outline-variant p-5">
              <p className="font-mono-technical text-[9px] text-on-surface-variant mb-4">MISUSE / 错误示范</p>
              <div className="flex items-end gap-8">
                <div className="text-center">
                  <div className="overflow-hidden h-10"><img src="/portfolio/images/科技园-logo.png" alt="" className="w-10 h-10 origin-top" style={{ transform: 'scaleX(1.8)' }} /></div>
                  <p className="font-mono-technical text-[9px] text-error mt-2">✕ 拉伸</p>
                </div>
                <div className="text-center">
                  <div className="h-10"><img src="/portfolio/images/科技园-logo.png" alt="" className="w-10 h-10" style={{ transform: 'rotate(20deg)' }} /></div>
                  <p className="font-mono-technical text-[9px] text-error mt-2">✕ 旋转</p>
                </div>
                <div className="text-center">
                  <div className="h-10"><img src="/portfolio/images/科技园-logo.png" alt="" className="w-10 h-10" style={{ filter: 'hue-rotate(120deg)' }} /></div>
                  <p className="font-mono-technical text-[9px] text-error mt-2">✕ 改色</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 02 COLOR SYSTEM · 色带（无描边） ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          <div className="md:col-span-7">
            <p className="font-label-micro text-label-micro uppercase text-on-surface-variant tracking-widest mb-3">
              02 · COLOR SYSTEM / 色彩系统
            </p>
            <div className="flex flex-col">
              <div className="flex items-center justify-between bg-[#2DAA9E] px-5 py-4">
                <span className="font-mono-technical text-[13px] text-white font-bold">科技青 · 主色</span>
                <span className="font-mono-technical text-[11px] text-white/85">#2DAA9E · C75 M0 Y25 K0</span>
              </div>
              <div className="flex items-center justify-between bg-[#2D82B2] px-5 py-4">
                <span className="font-mono-technical text-[13px] text-white font-bold">智慧蓝 · 辅1</span>
                <span className="font-mono-technical text-[11px] text-white/85">#2D82B2 · C80 M40 Y0 K0</span>
              </div>
              <div className="flex items-center justify-between bg-[#2D5A91] px-5 py-4">
                <span className="font-mono-technical text-[13px] text-white font-bold">深邃蓝 · 辅2</span>
                <span className="font-mono-technical text-[11px] text-white/85">#2D5A91 · C85 M60 Y15 K10</span>
              </div>
            </div>
            <div className="flex flex-col mt-2">
              <div className="flex items-center justify-between bg-white border-t border-outline-variant px-5 py-2.5">
                <span className="font-mono-technical text-[11px] text-on-surface">纯白 #FFFFFF</span>
                <span className="font-mono-technical text-[9px] text-on-surface-variant">页面背景 · 负空间</span>
              </div>
              <div className="flex items-center justify-between bg-[#F5F5F7] px-5 py-2.5">
                <span className="font-mono-technical text-[11px] text-on-surface">浅灰 #F5F5F7</span>
                <span className="font-mono-technical text-[9px] text-on-surface-variant">背景层次 · 装饰</span>
              </div>
              <div className="flex items-center justify-between bg-[#666666] px-5 py-2.5">
                <span className="font-mono-technical text-[11px] text-white">中灰 #666666</span>
                <span className="font-mono-technical text-[9px] text-white/70">辅助说明文字</span>
              </div>
              <div className="flex items-center justify-between bg-[#333333] px-5 py-2.5">
                <span className="font-mono-technical text-[11px] text-white">深灰 #333333</span>
                <span className="font-mono-technical text-[9px] text-white/70">正文文字</span>
              </div>
            </div>
          </div>
          <div className="md:col-span-5">
            {/* ── 03 TYPOGRAPHY ── */}
            <p className="font-label-micro text-label-micro uppercase text-on-surface-variant tracking-widest mb-3">
              03 · TYPOGRAPHY / 字体系统
            </p>
            <div className="border border-outline-variant">
              <div className="flex items-baseline justify-between px-4 py-3 border-b border-outline-variant">
                <span className="font-bold text-[19px]">思源黑体</span>
                <span className="font-mono-technical text-[9px] text-on-surface-variant">L1 · BOLD · 32-64pt</span>
              </div>
              <div className="flex items-baseline justify-between px-4 py-3 border-b border-outline-variant">
                <span className="font-medium text-[15px]">许昌大学科技园 · 品牌视觉</span>
                <span className="font-mono-technical text-[9px] text-on-surface-variant">L2 · MEDIUM · 20-24pt</span>
              </div>
              <div className="flex items-baseline justify-between px-4 py-3 border-b border-outline-variant">
                <span className="text-[13px]">正文字体 · 专业 · 系统化 · 当代性</span>
                <span className="font-mono-technical text-[9px] text-on-surface-variant">L3 · REGULAR · 14-16pt</span>
              </div>
              <div className="flex items-baseline justify-between px-4 py-3">
                <span className="text-[11px] text-on-surface-variant">Source Sans Pro · 注释说明</span>
                <span className="font-mono-technical text-[9px] text-on-surface-variant">L4 · LIGHT · 10-12pt</span>
              </div>
            </div>
            <p className="font-mono-technical text-[9px] text-on-surface-variant mt-2 tracking-widest">
              行距 1.5-1.7 倍 · 英文 Tracking +20~50 · 中英基线对齐
            </p>
          </div>
        </div>

        {/* ── 04 GRID + 05 APPLICATION ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <p className="font-label-micro text-label-micro uppercase text-on-surface-variant tracking-widest mb-3">
              04 · GRID / 网格系统
            </p>
            <div className="border border-outline-variant p-5 mb-2">
              <div className="grid grid-cols-12 gap-px bg-outline-variant h-16">
                {Array.from({ length: 12 }).map((_, i) => <div key={i} className="bg-surface" />)}
              </div>
              <div className="flex items-center gap-5 mt-3">
                <div className="flex items-center gap-2"><div className="w-10 h-1 bg-[#2DAA9E]" /><span className="font-mono-technical text-[9px] text-on-surface-variant">基线</span></div>
                <div className="flex items-center gap-2"><div className="w-10 h-1 bg-[#333333]" /><span className="font-mono-technical text-[9px] text-on-surface-variant">列</span></div>
              </div>
            </div>
            <p className="font-mono-technical text-[9px] text-on-surface-variant tracking-widest">基线 + 模块化列网格 · Z 型动线 · 页面利用率 ~60%</p>
          </div>
          <div className="md:col-span-7">
            <p className="font-label-micro text-label-micro uppercase text-on-surface-variant tracking-widest mb-3">
              05 · APPLICATION / 应用系统
            </p>
            <div className="border border-outline-variant divide-y divide-outline-variant">
              <div className="flex justify-between px-4 py-3"><span className="text-[12px]">名片 · 白底 + 标志左对齐</span><span className="font-mono-technical text-[9px] text-on-surface-variant">B-16</span></div>
              <div className="flex justify-between px-4 py-3"><span className="text-[12px]">档案袋 · 青绿袋口覆膜</span><span className="font-mono-technical text-[9px] text-on-surface-variant">250-300g</span></div>
              <div className="flex justify-between px-4 py-3"><span className="text-[12px]">马克杯 · 标志居中安全距 ≥15mm</span><span className="font-mono-technical text-[9px] text-on-surface-variant">陶瓷</span></div>
              <div className="flex justify-between px-4 py-3"><span className="text-[12px]">网站 / APP · 标志 ≥24px · 青色交互</span><span className="font-mono-technical text-[9px] text-on-surface-variant">DIGITAL</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal scroll track — full bleed; desktop: fills viewport while pinned */}
      <div
        className="overflow-hidden md:h-[calc(100vh-10rem)] md:min-h-[560px] md:flex md:items-center"
        data-animate="horizontal-scroll-track"
      >
        <div
          className="flex flex-nowrap"
          data-animate="horizontal-scroll-strip"
          style={{ width: 'max-content', height: 'clamp(280px, 45vh, 520px)' }}
        >
          {XCU_IMAGES.map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt={img.alt}
              className="h-full w-auto flex-shrink-0"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export function GujiShowcase() {
  return (
    <section
      className="border-t border-b border-outline-variant"
      data-section="guji-showcase"
    >
      <div className="px-margin-outer pt-8 pb-4">
        <p className="font-label-micro text-label-micro uppercase text-on-surface-variant tracking-widest">
          VISUAL SHOWCASE · 原件 → 识别文本对比
        </p>
      </div>

      <div className="px-margin-outer pb-8 grid grid-cols-1 md:grid-cols-2 gap-6" data-reveal>
        {/* Left: original scanned page */}
        <div>
          <div className="pb-2">
            <span className="font-mono-technical text-[9px] text-on-surface-variant uppercase tracking-widest">
              ORIGINAL · 原始扫描页
            </span>
          </div>
          <img
            src="/portfolio/images/古籍-原始扫描页.webp"
            alt="古籍原始扫描页"
            className="w-full object-contain"
            style={{ maxHeight: '70vh' }}
          />
        </div>

        {/* Right: recognized text — two versions stacked */}
        <div className="flex flex-col gap-4">
          {/* Traditional Chinese */}
          <div>
            <div className="pb-2">
              <span className="font-mono-technical text-[9px] text-on-surface-variant uppercase tracking-widest">
                OCR RESULT · 繁體原文
              </span>
            </div>
            <div className="overflow-y-auto scrollbar-hide scroll-container" style={{ maxHeight: '32vh' }}>
              <p className="text-[13px] leading-loose text-on-surface tracking-wide whitespace-pre-line">
{`哲學概論
四

困難，所以他此書是以美國康寧漢教授的『哲學問題』(Problems of Philosophy)一書第二版作藍本編譯而成。康寧漢的原書美國許多大學都採爲哲學概論一科的教本，實在不失爲一本好書。

康寧漢氏以研究黑格爾哲學著稱（所著黑格爾論實在與思想一書是他在康乃爾大學的博士論文，早已絕版），是現在美國代表新黑格爾學派最有表現的人。書中第一卷第四章論『意義』一部分爲第二版所特別增補，實包含著者的新貢獻，且亦融會了鮑森開(Bosanquet)論『涵攝』(Implication，依溫先生的譯名）和羅依士(Royce)論『解釋』(Interpretation)的思想在內。溫先生特別選出此書作爲他的哲學概論的藍本，也不爲無見。

從溫先生數年來教哲學概論的經驗看來，這書對於中國欲治哲學的讀者，必是很合用的。全書第一卷知識論，第二卷範疇論，第三卷價值論，條理井然。惟所謂『範疇論』初看頗費解，且康氏原書第一版亦無此綱目，細讀內容實相當於普通所謂『宇宙論』。以知識論上的專門名詞『範疇』來作宇宙論的標題，足見他活用範疇一名詞，亦足見他的宇宙論是受了康德(Kant)批導哲學的洗禮的。

我揣想他之標出範疇篇是受了路易士(Lewis)心與世界秩序(Mind and the World Order)一書的影響。至於他把『社會』亦列入範疇之一，亦爲普通所不經見，且亦係第二版所新加。我揣想（雖然他書中並未聲明）他是接受了杜威在一九二七年美國哲學會所提出『認社會爲哲學範疇』（Social as a Category）一篇論文的呼籲。

至於他在第一卷之末又新加論思想自由一章，顯然因爲一九三四年國際哲學大會中，因反對共產主義及法西斯主義對於哲學思想自由的干涉，曾熱烈討論過此問題而增加的。但我看於導言中略提此問題足矣，特別專章作爲知識論中的主題，實不相稱。

我希望這一番解釋`}
              </p>
            </div>
          </div>

          <hr className="border-outline-variant" />

          {/* Simplified Chinese */}
          <div>
            <div className="pb-2">
              <span className="font-mono-technical text-[9px] text-on-surface-variant uppercase tracking-widest">
                OCR RESULT · 简体转写
              </span>
            </div>
            <div className="overflow-y-auto scrollbar-hide scroll-container" style={{ maxHeight: '32vh' }}>
              <p className="text-[13px] leading-loose text-on-surface tracking-wide whitespace-pre-line">
{`哲学概论
四

困难，所以他此书是以美国康宁汉教授的『哲学问题』(Problems of Philosophy)一书第二版作蓝本编译而成。康宁汉的原书美国许多大学都采为哲学概论一科的教本，实在不失为一本好书。

康宁汉氏以研究黑格尔哲学著称（所著黑格尔论实在与思想一书是他在康乃尔大学的博士论文，早已绝版），是现在美国代表新黑格尔学派最有表现的人。书中第一卷第四章论『意义』一部分为第二版所特别增补，实包含着者的新贡献，且亦融会了鲍森开(Bosanquet)论『涵摄』(Implication，依温先生的译名）和罗依士(Royce)论『解释』(Interpretation)的思想在内。温先生特别选出此书作为他的哲学概论的蓝本，也不为无见。

从温先生数年来教哲学概论的经验看来，这书对于中国欲治哲学的读者，必是很合用的。全书第一卷知识论，第二卷范畴论，第三卷价值论，条理井然。惟所谓『范畴论』初看颇费解，且康氏原书第一版亦无此纲目，细读内容实相当于普通所谓『宇宙论』。以知识论上的专门名词『范畴』来作宇宙论的标题，足见他活用范畴一名词，亦足见他的宇宙论是受了康德(Kant)批导哲学的洗礼的。

我揣想他之标出范畴篇是受了路易士(Lewis)心与世界秩序(Mind and the World Order)一书的影响。至于他把『社会』亦列入范畴之一，亦为普通所不经见，且亦系第二版所新加。我揣想（虽然他书中并未声明）他是接受了杜威在一九二七年美国哲学会所提出『认社会为哲学范畴』（Social as a Category）一篇论文的呼吁。

至于他在第一卷之末又新加论思想自由一章，显然因为一九三四年国际哲学大会中，因反对共产主义及法西斯主义对于哲学思想自由的干涉，曾热烈讨论过此问题而增加的。但我看于导言中略提此问题足矣，特别专章作为知识论中的主题，实不相称。

我希望这一番解释`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Agent Pipeline Architecture — uniform horizontal grid */}
      <div className="px-margin-outer pb-8 pt-4 overflow-x-auto scrollbar-hide scroll-container border-t border-outline-variant" data-reveal>
        <div className="pb-2">
          <span className="font-mono-technical text-[9px] text-on-surface-variant uppercase tracking-widest">
            PIPELINE · 三Agent管线架构
          </span>
        </div>

        <div className="grid grid-cols-5 gap-px bg-outline border border-outline" style={{ minWidth: '800px' }}>
          {/* Step 1: Input */}
          <div className="bg-surface-container flex flex-col items-center justify-center p-4 text-center" style={{ minHeight: '160px' }}>
            <span className="font-mono-technical text-[10px] text-on-surface font-bold">INPUT</span>
            <span className="font-mono-technical text-[9px] text-on-surface mt-2">古籍图片 / PDF</span>
          </div>

          {/* Step 2: Agent 1 */}
          <div className="bg-surface p-4 flex flex-col" style={{ minHeight: '160px' }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono-technical text-[10px] text-on-surface font-bold">AGENT 1</span>
              <span className="font-mono-technical text-[8px] text-on-surface-variant">QWEN3.7</span>
            </div>
            <span className="font-mono-technical text-[9px] text-on-surface mb-3">OCR 识别</span>
            <div className="mt-auto space-y-1">
              <div className="text-[9px] text-on-surface-variant">入 → PDF / 图片</div>
              <div className="text-[9px] text-on-surface-variant">出 → out/txt,json</div>
            </div>
          </div>

          {/* Step 3: Agent 2 */}
          <div className="bg-surface p-4 flex flex-col" style={{ minHeight: '160px' }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono-technical text-[10px] text-on-surface font-bold">AGENT 2</span>
              <span className="font-mono-technical text-[8px] text-on-surface-variant">DS-V4</span>
            </div>
            <span className="font-mono-technical text-[9px] text-on-surface mb-3">页序重排</span>
            <div className="mt-auto space-y-1">
              <div className="text-[9px] text-on-surface-variant">入 → page_*.txt</div>
              <div className="text-[9px] text-on-surface-variant">法 → LLM连贯性判断</div>
              <div className="text-[9px] text-on-surface-variant">出 → out_v/txt,json</div>
            </div>
          </div>

          {/* Step 4: Agent 3 */}
          <div className="bg-surface p-4 flex flex-col" style={{ minHeight: '160px' }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono-technical text-[10px] text-on-surface font-bold">AGENT 3</span>
              <span className="font-mono-technical text-[8px] text-on-surface-variant">DS-V4</span>
            </div>
            <span className="font-mono-technical text-[9px] text-on-surface mb-3">错别字纠正</span>
            <div className="mt-auto space-y-1">
              <div className="text-[9px] text-on-surface-variant">入 → page_*.txt</div>
              <div className="text-[9px] text-on-surface-variant">法 → 形近字表替换</div>
              <div className="text-[9px] text-on-surface-variant">出 → out_c/txt,json</div>
            </div>
          </div>

          {/* Step 5: Output */}
          <div className="bg-on-surface flex flex-col items-center justify-center p-4 text-center" style={{ minHeight: '160px' }}>
            <span className="font-mono-technical text-[10px] text-surface font-bold">OUTPUT</span>
            <span className="font-mono-technical text-[9px] text-surface/60 mt-2">干净文本</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export function VideoFactoryShowcase() {
  return (
    <section
      className="border-t border-outline-variant"
      data-section="video-factory-showcase"
    >
      <div className="px-margin-outer pt-8 pb-4">
        <p className="font-label-micro text-label-micro uppercase text-on-surface-variant tracking-widest">
          VISUAL SHOWCASE · 五阶段视频生产流水线
        </p>
      </div>

      {/* Pipeline — uniform horizontal grid */}
      <div className="px-margin-outer pb-8 overflow-x-auto scrollbar-hide scroll-container border-t border-outline-variant pt-4" data-reveal>
        {/* grid-cols-2 on mobile so the 9px mono cells stay readable (3 cols of
            ~110px would crush the text); md: the full 6-phase pipeline. */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-px bg-outline border border-outline">
          {/* System 0: 素材库管理 — a supporting system, NOT a pipeline phase
              (the pipeline is the 5 phases PHASE 1–5 below). */}
          <div className="bg-surface-container p-4 flex flex-col" style={{ minHeight: '200px' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono-technical text-[10px] text-on-surface font-bold">SYSTEM 0</span>
              <span className="font-mono-technical text-[8px] text-on-surface-variant">LOCAL</span>
            </div>
            <span className="font-mono-technical text-[9px] text-on-surface mb-3">素材库管理</span>
            <div className="space-y-2 text-[9px] text-on-surface-variant leading-snug">
              <div>每次下载素材自动做三件事：<br/>命名入库、视觉描述、去重索引</div>
              <div>OpenCV 提取首/中/尾三帧<br/>visual-proxy 中文视觉描述<br/>（主体_动作_场景_空间_景别_运动_情绪）</div>
              <div>URL 和文件 hash 双重去重<br/>项目越多素材越全——随时间增值的资产库</div>
            </div>
          </div>

          {/* Phase 1: SPLIT */}
          <div className="bg-surface p-4 flex flex-col" style={{ minHeight: '200px' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono-technical text-[10px] text-on-surface font-bold">PHASE 1</span>
              <span className="font-mono-technical text-[8px] text-on-surface-variant">LLM</span>
            </div>
            <span className="font-mono-technical text-[9px] text-on-surface mb-3">文案智能拆分</span>
            <div className="space-y-2 text-[9px] text-on-surface-variant leading-snug">
              <div>按标点断句：。！？主切<br/>逗号辅助，每句 ≤40 字</div>
              <div>标注 6 种内容类型：<br/>时间锚点 / 主体陈述 / 金句<br/>列举 / 数据 / 对比</div>
              <div>每句分配动效策略<br/>提取素材关键词<br/>输出 segments.json</div>
            </div>
          </div>

          {/* Phase 2: TTS */}
          <div className="bg-surface p-4 flex flex-col" style={{ minHeight: '200px' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono-technical text-[10px] text-on-surface font-bold">PHASE 2</span>
              <span className="font-mono-technical text-[8px] text-on-surface-variant">TTS</span>
            </div>
            <span className="font-mono-technical text-[9px] text-on-surface mb-3">豆包TTS配音</span>
            <div className="space-y-2 text-[9px] text-on-surface-variant leading-snug">
              <div>segments 逐句调用<br/>seed-tts-2.0 语音合成</div>
              <div>ffprobe 取精确音频时长<br/>帧数 = ceil(秒 × 30fps)</div>
              <div>根据时长自适应动效方案：<br/>短句简化，长句多 beat 拆分<br/>更新 segments.json</div>
            </div>
          </div>

          {/* Phase 3: ASSET */}
          <div className="bg-surface p-4 flex flex-col" style={{ minHeight: '200px' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono-technical text-[10px] text-on-surface font-bold">PHASE 3</span>
              <span className="font-mono-technical text-[8px] text-on-surface-variant">API</span>
            </div>
            <span className="font-mono-technical text-[9px] text-on-surface mb-3">素材智能匹配</span>
            <div className="space-y-2 text-[9px] text-on-surface-variant leading-snug">
              <div>关键词检索素材库索引<br/>汇报素材覆盖率</div>
              <div>用户选择策略 A–E：<br/>全部自动 / 优先本地 /<br/>优先质量 / 优先速度 / 手动</div>
              <div>Pexels / Pixabay 自动下载<br/>URL + hash 双重去重入库</div>
            </div>
          </div>

          {/* Phase 4: BRIEF */}
          <div className="bg-surface p-4 flex flex-col" style={{ minHeight: '200px' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono-technical text-[10px] text-on-surface font-bold">PHASE 4</span>
              <span className="font-mono-technical text-[8px] text-on-surface-variant">LLM</span>
            </div>
            <span className="font-mono-technical text-[9px] text-on-surface mb-3">视觉简报生成</span>
            <div className="space-y-2 text-[9px] text-on-surface-variant leading-snug">
              <div>分析文案整体气质<br/>生成 CSS 调色板 4–6 变量</div>
              <div>定义字体策略 + 动画语言<br/>（偏好列表 + 禁止列表）</div>
              <div>产出 project-brief.md<br/>所有子 Agent 的统一视觉宪法<br/>design Skill 可插拔替换</div>
            </div>
          </div>

          {/* Phase 5: RENDER */}
          <div className="bg-on-surface p-4 flex flex-col" style={{ minHeight: '200px' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono-technical text-[10px] text-surface font-bold">PHASE 5</span>
              <span className="font-mono-technical text-[8px] text-surface/60">REMOTION</span>
            </div>
            <span className="font-mono-technical text-[9px] text-surface mb-3">并行渲染输出</span>
            <div className="space-y-2 text-[9px] text-surface/60 leading-snug">
              <div>brief + segments[i] →<br/>N 个 general-purpose Agent<br/>并行写 Scene&#123;id&#125;.tsx</div>
              <div>5 项自检通过 → Remotion<br/>Series 串联所有场景</div>
              <div>Remotion render →<br/>ffprobe 验证音画同步 →<br/>output.mp4 · 1920×1080@30fps</div>
            </div>
          </div>
        </div>
      </div>

      {/* Video showcase */}
      <div className="px-margin-outer pb-8 pt-4 border-t border-outline-variant" data-reveal>
        <div className="pb-2">
          <span className="font-mono-technical text-[9px] text-on-surface-variant uppercase tracking-widest">
            OUTPUT SHOWCASE · 产出展示
          </span>
        </div>

        {/* 4 video outputs. The 3 live pieces are hosted on Bilibili — each card
            is a poster linking out to the B站 page (iframe embeds are flaky off-
            site); Nano Talk is still being organized, so its card is a poster
            only until a link is ready. */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { poster: '/portfolio/images/视频封面-AI视频制作.jpg', caption: 'AI视频制作', url: 'https://www.bilibili.com/video/BV12Qb96MEYQ' },
            { poster: '/portfolio/images/视频封面-nano-tech-life.jpg', caption: 'Nano Tech Life', url: 'https://www.bilibili.com/video/BV1mSb96zEDc' },
            { poster: '/portfolio/images/视频封面-nano-talk.jpg', caption: 'Nano Talk', url: null },
            { poster: '/portfolio/images/视频封面-餐饮界现状.jpg', caption: '餐饮界现状', url: 'https://www.bilibili.com/video/BV1MSb966E86' },
          ].map((v, i) => (
            <div key={i}>
              <a
                href={v.url ?? undefined}
                target={v.url ? '_blank' : undefined}
                rel={v.url ? 'noopener noreferrer' : undefined}
                className={`block group ${v.url ? '' : 'cursor-default'}`}
              >
                <img
                  src={v.poster}
                  alt={v.caption}
                  loading="lazy"
                  className="w-full aspect-[16/9] object-cover border border-outline-variant"
                />
              </a>
              <p className="font-mono-technical text-[10px] text-on-surface-variant mt-2 text-center">{v.caption}</p>
              <p className="font-mono-technical text-[9px] text-brand-accent mt-0.5 text-center uppercase tracking-widest">
                {v.url
                  ? <a href={v.url} target="_blank" rel="noopener noreferrer" className="hover:underline">▶ 在 B 站观看 ↗</a>
                  : 'B站整理中'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ImageWorkflowShowcase() {
  const steps = [
    {
      label: 'INPUT 原图',
      desc: '原始产品随手拍',
      detail: '办公桌随手拍，自然光环境，无布光无布景。原始文件直接进入管线，无需任何预处理。',
      src: '/portfolio/images/啤酒工作流-01原图.jpg',
    },
    {
      label: 'M1 抠图',
      desc: '背景移除 → 产品主体提取',
      detail: 'BiRefNet 深度学习模型自动识别产品轮廓，剥离杂乱背景，输出透明通道产品主体 + 精准遮罩。',
      src: '/portfolio/images/啤酒工作流-02抠图.webp',
    },
    {
      label: '后2+3 超分调色',
      desc: 'ESRGAN 4× 超分 → 电影调色',
      detail: '本地 ESRGAN 4x-UltraSharp 无损放大至 4K，Pro 电影调色台统一全店视觉风格。',
      src: '/portfolio/images/啤酒工作流-03调色.webp',
    },
  ]

  return (
    <section
      className="border-t border-outline-variant"
      data-section="image-workflow-showcase"
    >
      <div className="px-margin-outer pt-4 pb-1">
        <p className="font-label-micro text-label-micro uppercase text-on-surface-variant tracking-widest">
          VISUAL SHOWCASE · 输入 → 输出对比
        </p>
      </div>

      <div className="px-margin-outer pb-4" data-reveal>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
          {/* LEFT (3/5): process steps — text + images */}
          <div className="md:col-span-3 bg-surface p-4">
            <div className="flex flex-col h-full">
              {/* Text row */}
              <div className="flex gap-4">
                {steps.map((step, i) => (
                  <div key={step.label} className="flex-1 min-w-0">
                    <div className="mb-1.5">
                      <span className="font-mono-technical text-[9px] text-on-surface-variant tracking-wider">
                        STEP 0{i + 1}
                      </span>
                    </div>
                    <span className="text-[11px] text-on-surface font-bold block mb-1">
                      {step.label}
                    </span>
                    <span className="font-mono-technical text-[9px] text-on-surface block mb-1">
                      {step.desc}
                    </span>
                    <span className="text-[10px] text-on-surface-variant leading-relaxed">
                      {step.detail}
                    </span>
                  </div>
                ))}
              </div>

              {/* Image row */}
              <div className="flex-1 min-h-0 flex gap-4 mt-3">
                {steps.map((step, i) => (
                  <div key={step.label} className="flex-1 min-h-0 flex items-end justify-center">
                    <img
                      src={step.src}
                      alt={step.label}
                      className="w-full object-contain"
                      style={{ maxHeight: '100%' }}
                      data-process-step={i}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT (2/5): output preview — centered in column */}
          <div className="md:col-span-2 bg-surface p-4 flex flex-col items-center">
            <div
              className="flex-1 min-h-0 overflow-y-auto scrollbar-hide scroll-container border border-outline-variant"
              style={{ aspectRatio: '1086 / 1446', maxWidth: '440px' }}
            >
              <img
                src="/portfolio/images/啤酒工作流-04成品详情页.webp"
                alt="最终成品详情页"
                className="w-full block"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function PortfolioShowcase() {
  const H = ({ n, c }: { n: string; c: string }) => (
    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-outline-variant bg-surface-container">
      <span className="font-mono-technical text-[8px] text-on-surface-variant font-bold">{n}</span>
      <span className="font-mono-technical text-[8px] text-on-surface uppercase tracking-wider">{c}</span>
    </div>
  )
  const B = ({ children }: { children: React.ReactNode }) => (
    <div className="border border-outline">{children}</div>
  )

  return (
    <section className="border-t border-outline-variant" data-section="portfolio-showcase">
      {/* Showcase header — big scanline title + a prominent purple CTA that
          jumps to the FULL rendered 43-component library (public/design-system). */}
      <div className="px-margin-outer pt-10 pb-5 flex flex-col lg:flex-row lg:items-end gap-5 lg:justify-between border-b border-outline">
        <div>
          <p className="font-label-micro text-label-micro uppercase text-brand-accent tracking-widest mb-3">
            DESIGN SYSTEM / 设计系统组件库 · 43 COMPONENTS
          </p>
          <h3
            className="heading-scanlines uppercase tracking-tighter text-on-surface"
            style={{ fontSize: 'clamp(30px, 5vw, 64px)', lineHeight: 0.95 }}
          >
            COMPONENT<br />LIBRARY
          </h3>
        </div>
        <a
          href="/portfolio/design-system/index.html"
          target="_blank"
          rel="noopener noreferrer"
          /* Vertical padding = the title's line-height (0.95 × its clamp size),
             so the CTA's up/down matches the heading's; horizontal = 6× that
             (doubled from the earlier 3× per user). */
          className="self-start lg:self-auto inline-flex items-center gap-4 font-sans text-[18px] lg:text-[24px] font-black uppercase tracking-widest py-[calc(clamp(30px,5vw,64px)*0.95)] px-[calc(clamp(30px,5vw,64px)*0.95*6+100px)] bg-transparent text-on-surface border border-brand-accent hover:bg-brand-accent hover:text-surface hover:border-brand-accent transition-none"
        >
          查看完整组件库 ↗
        </a>
      </div>
      <div className="px-margin-outer pb-6 space-y-3">

        {/* ══════ CATEGORY: 导航 NAVIGATION ══════ */}
        <div className="flex items-center gap-3 mt-5 mb-1">
          <span className="font-mono-technical text-[8px] text-brand-accent font-bold uppercase tracking-widest">Navigation</span>
          <span className="flex-1 h-px bg-outline-variant" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* 01 TopNavBar */}
          <B><H n="01" c="TOPBAR / 顶部导航栏"/>
            <div className="bg-surface p-3 flex items-center justify-between border-b border-outline-variant">
              <span className="font-mono-technical text-[10px] text-on-surface font-bold tracking-wider">DAIU</span>
              <div className="flex gap-4">
                {['WORKS','ABOUT','CONTACT'].map(x=><span key={x} className="font-label-micro text-label-micro uppercase text-on-surface-variant tracking-widest">{x}</span>)}
              </div>
            </div></B>
          {/* 02 FixedSideIndicator */}
          <B><H n="02" c="FIXED SIDE INDICATOR / 侧边指示器"/>
            <div className="p-3 flex items-center gap-3">
              <div className="border border-outline px-2.5 py-1.5 flex items-center gap-1.5"><span className="w-2 h-2 bg-on-surface"/><span className="font-mono-technical text-[7px] text-on-surface uppercase tracking-widest">LIVE</span></div>
              <div className="border border-outline px-2.5 py-1.5 flex items-center gap-1.5 bg-on-surface"><span className="w-2 h-2 bg-surface"/><span className="font-mono-technical text-[7px] text-surface uppercase tracking-widest">STATUS</span></div>
            </div></B>
        </div>

        {/* ══════ CATEGORY: 英雄区 HERO ══════ */}
        <div className="flex items-center gap-3 mt-5 mb-1">
          <span className="font-mono-technical text-[8px] text-brand-accent font-bold uppercase tracking-widest">Hero</span>
          <span className="flex-1 h-px bg-outline-variant" />
        </div>
        <div className="space-y-3">
          {/* 03 HeroSection */}
          <B><H n="03" c="HERO SECTION / 英雄区首屏"/>
            <div className="p-4 grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <p className="text-label-micro uppercase text-on-surface-variant tracking-widest mb-2">SYS.VER 2026.08 // AVAILABLE</p>
                <p style={{fontSize:'clamp(48px,6vw,80px)',fontWeight:900,lineHeight:.92,letterSpacing:'-.04em'}} className="text-on-surface heading-scanlines">AIGC<br/>DESIGNER</p>
                <p className="font-mono-technical text-[12px] text-outline mt-1">/ KONG DEYU</p>
              </div>
              <div className="col-span-12 md:col-span-6 flex flex-col justify-end"><p className="text-body-md text-on-surface-variant leading-relaxed">设计生产系统化 · AIGC 工作流搭建</p></div>
            </div></B>
          {/* 21 DarkEdgeHero */}
          <B><H n="21" c="DARK EDGE HERO / 暗色边缘裁剪"/>
            <div className="bg-on-surface p-4 overflow-hidden">
              <p style={{fontSize:'clamp(60px,8vw,120px)',fontWeight:900,lineHeight:.88,letterSpacing:'-.04em'}} className="text-surface heading-scanlines ml-[-0.05em]">DARK<br/>EDGE<br/>HERO</p>
            </div></B>
          {/* 25 OverlappingHeroTitle */}
          <B><H n="25" c="OVERLAPPING HERO / 重叠标题"/>
            <div className="p-4 relative">
              <p style={{fontSize:'clamp(40px,6vw,80px)',fontWeight:900,lineHeight:.9,letterSpacing:'-.03em'}} className="text-on-surface text-letterpress">PORTFOLIO</p>
              <p className="font-mono-technical text-[10px] text-outline mt-1">PROJECT INDEX · 作品索引</p>
            </div></B>
        </div>

        {/* ══════ CATEGORY: 概览/背景 OVERVIEW ══════ */}
        <div className="flex items-center gap-3 mt-5 mb-1">
          <span className="font-mono-technical text-[8px] text-brand-accent font-bold uppercase tracking-widest">Overview / Background</span>
          <span className="flex-1 h-px bg-outline-variant" /></div>
        <div className="grid grid-cols-2 gap-3">
          {/* 04 StatsSection */}
          <B><H n="04" c="STATS SECTION / 统计卡片"/>
            <div className="grid grid-cols-2 gap-px bg-outline">
              {[{v:'53',l:'源文件',d:'SOURCE FILES'},{v:'60+',l:'数据字段',d:'FIELDS'},{v:'6',l:'项目数',d:'PROJECTS'},{v:'19',l:'区块组件',d:'SECTIONS'}].map(s=>(<div key={s.l} className="bg-surface p-3"><div className="text-on-surface font-black tracking-tighter leading-none mb-0.5" style={{fontSize:'clamp(22px,3vw,34px)'}}>{s.v}</div><p className="text-label-micro text-on-surface tracking-wider mb-0.5">{s.l}</p><p className="text-[7px] text-on-surface-variant uppercase tracking-widest">{s.d}</p></div>))}</div></B>
          {/* 15 OverviewPositioning */}
          <B><H n="15" c="OVERVIEW POSITIONING / 概览定位"/>
            <div className="p-3"><p className="text-body-md text-on-surface leading-relaxed mb-2">作为AIGC设计师，常规作品集平台无法承载"可复用的生产系统"这一核心叙事。自建网站不仅是展示载体，本身就是一个完整的设计工程项目。</p><p className="text-[9px] text-on-surface-variant">定位说明 · 能力概述 · 成果总结 — 三段式结构</p></div></B>
          {/* 16 PainPointsTargetVector */}
          <B><H n="16" c="PAIN POINTS / 痛点向量"/>
            <div className="p-3 space-y-2">
              {[{l:'品牌辨识度不足',d:'缺乏系统视觉识别规范，未能有效传达品牌气质'},{l:'信息架构松散',d:'核心业务分散罗列，客户难以快速建立服务能力全景'},{l:'模板化风险',d:'需避免通用模板风格及空洞科技感套路'}].map((x,i)=>(<div key={i} className="flex items-start gap-2"><span className="font-mono-technical text-[9px] text-outline font-bold flex-shrink-0">{String(i+1).padStart(2,'0')}</span><div><p className="font-label-micro text-on-surface uppercase tracking-wider">{x.l}</p><p className="text-[8px] text-on-surface-variant leading-relaxed">{x.d}</p></div></div>))}</div></B>
          {/* 22 VerticalLabelLayout */}
          <B><H n="22" c="VERTICAL LABEL / 垂直标签"/>
            <div className="p-3 flex gap-3"><div className="flex flex-col items-center" style={{writingMode:'vertical-rl'}}><span className="font-mono-technical text-[8px] text-on-surface-variant tracking-widest">DESIGN_SYSTEM_RADICAL_HELVETICA</span></div><p className="text-[9px] text-on-surface-variant leading-relaxed flex-1">垂直标签布局，适用于侧边栏标记、项目水印、装饰性文字等场景。writing-mode: vertical-rl。</p></div></B>
          {/* 26 PhilosophyImageSection */}
          <B><H n="26" c="PHILOSOPHY / 理念图文"/>
            <div className="p-3 border-l-2 border-outline ml-3 my-3">
              <p className="text-headline-lg heading-scanlines text-on-surface mb-2">秩序之下的激进</p>
              <p className="text-body-md text-on-surface-variant leading-relaxed mb-2">瑞士国际主义骨架+构成主义结构逻辑+1980s数字终端气质。底层严格对齐，网格始终存在，信息结构优先于视觉装饰。</p>
              <p className="font-mono-technical text-[8px] text-on-surface-variant uppercase tracking-widest">RADICAL EXPRESSION UNDER STRUCTURAL DISCIPLINE</p>
            </div></B>
        </div>

        {/* ══════ CATEGORY: 流程/架构 PIPELINE ══════ */}
        <div className="flex items-center gap-3 mt-5 mb-1">
          <span className="font-mono-technical text-[8px] text-brand-accent font-bold uppercase tracking-widest">Pipeline / Architecture</span>
          <span className="flex-1 h-px bg-outline-variant" /></div>
        <div className="space-y-3">
          {/* 05 AgentPipelineCards */}
          <B><H n="05" c="AGENT PIPELINE / Agent流程卡片"/>
            <div className="grid grid-cols-3 gap-px bg-outline">
              {[{a:'AGENT 1',l:'OCR识别',i:'PDF/图片',o:'TXT/JSON'},{a:'AGENT 2',l:'页序重排',i:'page_*.txt',o:'排序JSON'},{a:'AGENT 3',l:'错字纠正',i:'全文文本',o:'干净文本'}].map(x=>(<div key={x.a} className="bg-surface p-3 flex flex-col"><span className="font-mono-technical text-[7px] text-on-surface-variant mb-1">{x.a}</span><span className="font-mono-technical text-[9px] text-on-surface font-bold mb-2">{x.l}</span><div className="mt-auto space-y-0.5 text-[7px] text-on-surface-variant"><div>入→{x.i}</div><div>出→{x.o}</div></div></div>))}</div></B>
          {/* 06 WorkflowVisualization */}
          <B><H n="06" c="WORKFLOW / 工作流可视化"/>
            <div className="grid grid-cols-6 gap-px bg-outline">
              {['INPUT','ANALYZE','EXTRACT','TRANSFORM','VALIDATE','OUTPUT'].map((x,i)=>(<div key={x} className="bg-surface p-2.5 text-center"><span className="font-mono-technical text-[7px] text-on-surface-variant">{String(i+1).padStart(2,'0')}</span><p className="font-mono-technical text-[8px] text-on-surface font-bold mt-1">{x}</p></div>))}</div></B>
          {/* 23 HorizontalAgentPipeline */}
          <B><H n="23" c="HORIZONTAL PIPELINE / 横向管线"/>
            <div className="overflow-x-auto"><div className="flex gap-px bg-outline" style={{minWidth:500}}>
              {[{p:'PHASE 1',l:'设计系统建立',s:'43 COMPONENTS'},{p:'PHASE 2',l:'数据模型设计',s:'60+ FIELDS'},{p:'PHASE 3',l:'组件开发',s:'53 SOURCES'},{p:'PHASE 4',l:'内容审查',s:'IMPECCABLE'},{p:'PHASE 5',l:'动效系统',s:'5 GSAP MODULES'}].map(x=>(<div key={x.p} className="flex-1 bg-surface p-2.5 flex flex-col"><span className="font-mono-technical text-[7px] text-on-surface-variant mb-0.5">{x.p}</span><span className="font-mono-technical text-[8px] text-on-surface font-bold mb-1.5">{x.l}</span><span className="font-mono-technical text-[7px] text-on-surface-variant mt-auto">{x.s}</span></div>))}</div></div></B>
        </div>

        {/* ══════ CATEGORY: 决策/Q&A DECISIONS ══════ */}
        <div className="flex items-center gap-3 mt-5 mb-1">
          <span className="font-mono-technical text-[8px] text-brand-accent font-bold uppercase tracking-widest">Decisions / Q&A</span>
          <span className="flex-1 h-px bg-outline-variant" /></div>
        <div className="grid grid-cols-2 gap-3">
          {/* 07 QADecisionsSection */}
          <B><H n="07" c="QA DECISIONS / 问答决策"/>
            <div className="p-3 space-y-2">
              {[{q:'为什么选择自建网站而非Behance？',a:'这些平台展示单张图片，而我的产出是可复用的生产系统——结构化信息在图片流里会丢失。'},{q:'如何把43个HTML组件映射到React？',a:'不复制HTML，提取设计令牌——颜色、字体、间距、边线、网格写入@theme，React组件引用token继承规则。'}].map((x,i)=>(<div key={i} className="border-l-2 border-outline pl-3"><p className="font-label-micro text-on-surface mb-0.5">Q_0{i+1} · {x.q}</p><p className="text-[9px] text-on-surface-variant leading-relaxed">→ {x.a}</p></div>))}</div></B>
          {/* 19 KeyDecisionsCards */}
          <B><H n="19" c="KEY DECISIONS / 关键决策卡片"/>
            <div className="p-3 space-y-2">
              {[{i:'D_01',q:'设计风格如何匹配品牌？',a:'从品牌关键词反推视觉语言——专业可靠务实→瑞士国际主义'},{i:'D_02',q:'为什么产出三套方案？',a:'客户在对比中锁定方向，一轮确认取代多轮迭代'}].map(x=>(<div key={x.i} className="border border-outline p-2.5"><span className="font-mono-technical text-[7px] text-on-surface-variant">{x.i}</span><p className="text-label-micro text-on-surface mt-0.5 mb-0.5">{x.q}</p><p className="text-[8px] text-on-surface-variant leading-relaxed">{x.a}</p></div>))}</div></B>
        </div>

        {/* ══════ CATEGORY: 代码/技术 CODE ══════ */}
        <div className="flex items-center gap-3 mt-5 mb-1">
          <span className="font-mono-technical text-[8px] text-brand-accent font-bold uppercase tracking-widest">Code / Technical</span>
          <span className="flex-1 h-px bg-outline-variant" /></div>
        <div className="grid grid-cols-2 gap-3">
          {/* 08 CodeBlockDisplay */}
          <B><H n="08" c="CODE BLOCK / 代码展示"/>
            <div className="bg-on-surface p-4"><pre className="font-mono-technical text-[9px] leading-relaxed overflow-x-auto">
              <code><span className="text-[#c4b5fd]">export</span> <span className="text-[#82aaff]">function</span> <span className="text-[#ffcb6b]">cn</span>(<span className="text-surface/60">...inputs</span>) {'{'} <span className="text-[#c4b5fd]">return</span> <span className="text-[#ffcb6b]">twMerge</span>(<span className="text-[#ffcb6b]">clsx</span>(inputs)) {'}'}</code>
            </pre></div></B>
          {/* 11 DirectoryTree */}
          <B><H n="11" c="DIRECTORY TREE / 目录树"/>
            <div className="bg-on-surface p-4"><pre className="font-mono-technical text-[8px] text-surface/80 leading-relaxed whitespace-pre-wrap">{`src/
├── components/     # React组件
│   ├── project/    # 19个区块
│   ├── ui/         # Badge·SectionLabel
│   ├── navigation/ # TopNavBar
│   └── shared/     # Footer
├── data/           # 唯一数据源
├── types/          # 类型定义
└── styles/         # @theme tokens`}</pre></div></B>
        </div>

        {/* ══════ CATEGORY: 对比/方案 COMPARISON ══════ */}
        <div className="flex items-center gap-3 mt-5 mb-1">
          <span className="font-mono-technical text-[8px] text-brand-accent font-bold uppercase tracking-widest">Comparison / Strategy</span>
          <span className="flex-1 h-px bg-outline-variant" /></div>
        <div className="space-y-3">
          {/* 09 BeforeAfterComparison */}
          <B><H n="09" c="BEFORE/AFTER COMPARISON / 前后对比"/>
            <div className="overflow-x-auto"><div className="grid grid-cols-12 gap-px bg-outline text-[9px]" style={{minWidth:550}}>
              <div className="col-span-3 bg-surface p-2.5 font-label-micro uppercase text-on-surface tracking-wider">阶段</div><div className="col-span-4 bg-surface p-2.5 font-label-micro uppercase text-on-surface-variant tracking-wider">BEFORE / 传统</div><div className="col-span-5 bg-surface-container-low p-2.5 font-label-micro uppercase text-on-surface tracking-wider">AFTER / AUTOMATED</div>
              {[['设计提取','手工写CSS·半天','43组件→@theme·2h'],['组件开发','逐组件手写·2-3天','Token驱动·1天'],['数据录入','逐页硬编码·半天/项目','追加Object·30min'],['部署发布','FTP/手动上传','git push→自动']].map((r,i)=>(<div key={i} className="contents"><div className="col-span-3 bg-surface p-2 border-t border-outline-variant font-label-micro text-on-surface">{r[0]}</div><div className="col-span-4 bg-surface p-2 border-t border-outline-variant text-on-surface-variant">{r[1]}</div><div className="col-span-5 bg-surface-container-low p-2 border-t border-outline-variant text-on-surface font-medium">{r[2]}</div></div>))}</div></div></B>
          {/* 17 StrategyComparison */}
          <B><H n="17" c="STRATEGY COMPARISON / 方案对比"/>
            <div className="grid grid-cols-3 gap-px bg-outline">
              {[{s:'PRIMARY',t:'Swiss International',d:'黑白极简·12列网格·0px圆角·WCAG AA'},{s:'SECONDARY',t:'Modern Editorial',d:'暖橙强调色·衬线体·毛玻璃·点状网格纹理'},{s:'FLAGGED',t:'Dark Tech',d:'深蓝渐变·圆角卡片·P1对比度问题'}].map(x=>(<div key={x.t} className="bg-surface p-3 flex flex-col"><span className="font-mono-technical text-[7px] text-on-surface-variant mb-1">{x.s}</span><span className="font-mono-technical text-[9px] text-on-surface font-bold mb-2">{x.t}</span><p className="text-[8px] text-on-surface-variant leading-relaxed mt-auto">{x.d}</p></div>))}</div></B>
        </div>

        {/* ══════ CATEGORY: 数据/统计 METRICS ══════ */}
        <div className="flex items-center gap-3 mt-5 mb-1">
          <span className="font-mono-technical text-[8px] text-brand-accent font-bold uppercase tracking-widest">Data / Metrics</span>
          <span className="flex-1 h-px bg-outline-variant" /></div>
        <div className="grid grid-cols-2 gap-3">
          {/* 10 QualityChecklist */}
          <B><H n="10" c="QUALITY CHECKLIST / 质量清单"/>
            <div className="p-3 space-y-1.5">
              {[{n:'组件库视觉一致性',d:'颜色/字体/边线/网格/横纹全部对齐43组件库'},{n:'数据驱动架构验证',d:'新增项目仅追加Object，零代码改动'},{n:'TypeScript类型安全',d:'零any，完整interface覆盖'}].map((x,i)=>(<div key={i} className="flex items-start gap-2"><span className="font-mono-technical text-[8px] text-on-surface-variant">{String(i+1).padStart(2,'0')}</span><div><p className="font-label-micro text-on-surface">{x.n}</p><p className="text-[8px] text-on-surface-variant">{x.d}</p></div></div>))}</div></B>
          {/* 18 QualityAuditTable */}
          <B><H n="18" c="QUALITY AUDIT TABLE / 审查表"/>
            <div className="overflow-x-auto"><div className="grid grid-cols-4 gap-px bg-outline text-[8px]" style={{minWidth:320}}>
              <div className="bg-surface p-2 font-label-micro text-on-surface">#</div><div className="bg-surface p-2 font-label-micro text-on-surface">检查项</div><div className="bg-surface p-2 font-label-micro text-on-surface">状态</div><div className="bg-surface p-2 font-label-micro text-on-surface">备注</div>
              {[{i:'01',n:'视觉一致',s:'PASS'},{i:'02',n:'数据驱动',s:'PASS'},{i:'03',n:'类型安全',s:'PASS'}].map(r=>(<div key={r.i} className="contents"><div className="bg-surface p-1.5 border-t border-outline-variant font-mono-technical text-on-surface-variant">{r.i}</div><div className="bg-surface p-1.5 border-t border-outline-variant text-on-surface">{r.n}</div><div className="bg-surface p-1.5 border-t border-outline-variant font-mono-technical text-on-surface font-bold">{r.s}</div><div className="bg-surface p-1.5 border-t border-outline-variant text-on-surface-variant">✓</div></div>))}</div></div></B>
          {/* 20 OutputsStatsGrid */}
          <B><H n="20" c="OUTPUT STATS / 产出统计"/>
            <div className="grid grid-cols-2 gap-px bg-outline">
              {[{v:'100%',l:'通过率',d:'PASS RATE'},{v:'4/4',l:'检查通过',d:'CHECKS'},{v:'53',l:'源文件',d:'SOURCE FILES'},{v:'<2s',l:'构建时间',d:'BUILD TIME'}].map(x=>(<div key={x.l} className="bg-surface p-3 flex flex-col items-center text-center aspect-square justify-center"><div className="text-on-surface font-black tracking-tighter leading-none mb-1" style={{fontSize:'clamp(20px,3vw,32px)'}}>{x.v}</div><p className="text-label-micro text-on-surface tracking-wider mb-0.5">{x.l}</p><p className="text-[7px] text-on-surface-variant uppercase tracking-widest">{x.d}</p></div>))}</div></B>
          {/* 24 LargeMetricsGrid */}
          <B><H n="24" c="LARGE METRICS / 大字统计"/>
            <div className="grid grid-cols-2 gap-px bg-outline">
              {[{v:'90',u:'%',l:'成本压缩',d:'COST REDUCTION'},{v:'10',u:'×',l:'效率提升',d:'EFFICIENCY GAIN'},{v:'6',u:'个',l:'完整项目',d:'PROJECTS'},{v:'43',u:'个',l:'组件库',d:'COMPONENTS'}].map(x=>(<div key={x.l} className="bg-surface p-3"><div className="text-on-surface font-black tracking-tighter leading-none" style={{fontSize:'clamp(28px,4vw,48px)'}}>{x.v}<span className="text-on-surface-variant text-body-md font-normal ml-1">{x.u}</span></div><p className="text-label-micro text-on-surface tracking-wider mt-1">{x.l}</p><p className="text-[7px] text-on-surface-variant uppercase tracking-widest">{x.d}</p></div>))}</div></B>
        </div>

        {/* ══════ CATEGORY: 列表/索引 LISTS ══════ */}
        <div className="flex items-center gap-3 mt-5 mb-1">
          <span className="font-mono-technical text-[8px] text-brand-accent font-bold uppercase tracking-widest">Lists / Index</span>
          <span className="flex-1 h-px bg-outline-variant" /></div>
        <div className="grid grid-cols-2 gap-3">
          {/* 27 FeaturedWorksList */}
          <B><H n="27" c="FEATURED WORKS / 重点作品"/>
            <div className="p-3 space-y-2">
              {[{t:'端浮科技官网品牌设计',d:'B2B AI数据服务商·三套差异化视觉方案·Swiss胜出'},{t:'许昌大学科技园品牌数字形象',d:'47页VIS数字化提取·折页/大屏/展板·多场景物料系统'},{t:'模块化AI图片工作流积木系统',d:'10积木模块·8免费+2付费·¥1/张·3品类验证'}].map((x,i)=>(<div key={i} className="flex items-start gap-2 border-b border-outline-variant pb-1.5 last:border-0"><span className="font-mono-technical text-[8px] text-outline font-bold flex-shrink-0">{String(i+1).padStart(2,'0')}</span><div><p className="font-label-micro text-on-surface uppercase tracking-wider">{x.t}</p><p className="text-[8px] text-on-surface-variant leading-relaxed">{x.d}</p></div></div>))}</div></B>
          {/* 29 ProjectIndexHeader */}
          <B><H n="29" c="PROJECT INDEX / 索引页头"/>
            <div className="p-3"><div className="flex items-center justify-between border-b border-outline pb-1.5 mb-1.5 text-[8px]"><span className="font-mono-technical text-on-surface-variant">#</span><span className="font-mono-technical text-on-surface-variant">PROJECT</span><span className="font-mono-technical text-on-surface-variant">YEAR</span><span className="font-mono-technical text-on-surface-variant">STATUS</span></div>
            {[{i:'01',n:'端浮科技',y:'2024',s:'DELIVERED'},{i:'02',n:'许昌科技园',y:'2024-26',s:'DELIVERED'},{i:'03',n:'古籍OCR',y:'2024',s:'V1 READY'}].map(x=>(<div key={x.i} className="flex items-center justify-between border-b border-outline-variant py-1 last:border-0"><span className="font-mono-technical text-[8px] text-outline">{x.i}</span><span className="font-label-micro text-on-surface uppercase tracking-wider">{x.n}</span><span className="font-mono-technical text-[7px] text-on-surface-variant">{x.y}</span><span className="font-mono-technical text-[7px] text-on-surface font-bold">{x.s}</span></div>))}</div></B>
          {/* 30 ProjectArticleCard */}
          <B><H n="30" c="PROJECT CARD / 项目卡片"/>
            <div className="p-3">
              <div className="border border-outline p-3"><span className="font-mono-technical text-[7px] text-on-surface-variant">2024.04</span><p className="font-headline-lg-mobile text-on-surface mt-1 mb-1">端浮科技</p><p className="text-body-md text-on-surface-variant">B2B AI数据服务商品牌官网升级·三套方案</p><div className="flex gap-1.5 mt-2"><span className="inline-block text-label-micro uppercase border px-1.5 py-0.5 text-on-surface-variant border-outline-variant">UI Design</span><span className="inline-block text-label-micro uppercase border px-1.5 py-0.5 text-brand-accent border-brand-accent">Brand</span></div></div>
            </div></B>
        </div>

        {/* ══════ CATEGORY: 按钮/CTA BUTTONS ══════ */}
        <div className="flex items-center gap-3 mt-5 mb-1">
          <span className="font-mono-technical text-[8px] text-brand-accent font-bold uppercase tracking-widest">Buttons / CTA</span>
          <span className="flex-1 h-px bg-outline-variant" /></div>
        <div className="grid grid-cols-2 gap-3">
          {/* 28 GatewayCTASection */}
          <B><H n="28" c="GATEWAY CTA / 行动召唤"/>
            <div className="p-4 flex flex-col items-center text-center">
              <p className="text-headline-lg-mobile heading-scanlines text-on-surface mb-2">READY TO COLLABORATE</p>
              <p className="text-body-md text-on-surface-variant mb-3">苏州 AIGC 设计岗位 · 即刻可入职</p>
              <div className="flex gap-2"><span className="inline-block text-label-micro uppercase border px-4 py-2 text-on-surface border-on-surface">CONTACT ↗</span><span className="inline-block text-label-micro uppercase border px-4 py-2 text-surface bg-on-surface border-on-surface">DOWNLOAD CV ↓</span></div>
            </div></B>
          {/* 31 LoadMoreButton */}
          <B><H n="31" c="LOAD MORE / 加载更多"/>
            <div className="p-4 flex flex-col items-center text-center justify-center h-full">
              <span className="inline-block text-label-micro uppercase border px-6 py-3 text-on-surface-variant border-outline-variant">LOAD MORE PROJECTS ↓</span>
              <p className="text-[8px] text-on-surface-variant mt-2">border-outline-variant · uppercase · label-micro</p>
            </div></B>
          {/* 12 Footer */}
          <B><H n="12" c="FOOTER / 页脚"/>
            <div className="p-3"><div className="flex justify-between items-center mb-1.5"><span className="font-mono-technical text-[8px] text-on-surface-variant">© 2026 KONG DEYU</span><div className="flex gap-3">{['GITHUB','EMAIL','WECHAT'].map(x=><span key={x} className="font-label-micro text-[8px] uppercase text-on-surface-variant tracking-widest">{x}</span>)}</div></div><p className="text-[8px] text-on-surface-variant">视觉传达设计·许昌学院·AIGC Designer·苏州</p></div></B>
        </div>

        {/* ══════ CATEGORY: 设计标记 DESIGN TOKENS ══════ */}
        <div className="flex items-center gap-3 mt-5 mb-1">
          <span className="font-mono-technical text-[8px] text-brand-accent font-bold uppercase tracking-widest">Design Tokens</span>
          <span className="flex-1 h-px bg-outline-variant" /></div>
        <div className="grid grid-cols-2 gap-3">
          {/* 13 ColorPalette */}
          <B><H n="13" c="COLOR PALETTE / 色彩系统"/>
            <div className="flex flex-wrap gap-px bg-outline">
              {[{n:'surface',h:'#fcf9f8'},{n:'s-container',h:'#f0eded'},{n:'s-high',h:'#eae7e7'},{n:'s-highest',h:'#e5e2e1'},{n:'o-variant',h:'#c5c7c9'},{n:'outline',h:'#75777a'},{n:'on-s-var',h:'#44474a'},{n:'on-surface',h:'#1c1b1b'},{n:'accent',h:'#2E1065'}].map(c=>(<div key={c.n} className="flex-1 flex flex-col" style={{minWidth:65}}><div className="h-10" style={{backgroundColor:c.h}}/><div className="bg-surface px-1.5 py-1"><p className="font-mono-technical text-[6px] text-on-surface">{c.n}</p><p className="font-mono-technical text-[6px] text-on-surface-variant">{c.h}</p></div></div>))}</div></B>
          {/* 14 TypographySystem */}
          <B><H n="14" c="TYPOGRAPHY / 字体系统"/>
            <div className="p-3 space-y-1">
              <p style={{fontSize:'clamp(28px,4vw,48px)',fontWeight:900,lineHeight:.94,letterSpacing:'-.03em'}} className="text-on-surface heading-scanlines">HERO 120</p>
              <p className="text-headline-lg text-on-surface">HEADLINE 64</p>
              <p className="text-headline-lg-mobile text-on-surface">Mobile 40</p>
              <p className="text-body-md text-on-surface">Body MD 14px/20px</p>
              <p className="text-label-micro uppercase text-on-surface-variant tracking-widest">LABEL 10PX</p>
              <p className="font-mono-technical text-mono-technical text-on-surface-variant">Mono 12px · JetBrains Mono</p>
            </div></B>
          {/* 32 GridLinesBackground */}
          <B><H n="32" c="GRID BACKGROUND / 网格背景"/>
            <div className="p-3 relative overflow-hidden">
              <div className="grid grid-cols-12 gap-1"><div className="col-span-4 h-8 border border-outline-variant flex items-center justify-center"><span className="font-mono-technical text-[7px] text-on-surface-variant">4/12</span></div><div className="col-span-8 h-8 border border-outline-variant flex items-center justify-center"><span className="font-mono-technical text-[7px] text-on-surface-variant">8/12</span></div></div>
            </div></B>
        </div>

        {/* ══════ CATEGORY: 暗色终端 DARK TERMINAL ══════ */}
        <div className="flex items-center gap-3 mt-5 mb-1">
          <span className="font-mono-technical text-[8px] text-brand-accent font-bold uppercase tracking-widest">Dark Terminal</span>
          <span className="flex-1 h-px bg-outline-variant" /></div>
        <div className="grid grid-cols-2 gap-3">
          {/* 33 DarkSideNav */}
          <B><H n="33" c="DARK SIDE NAV / 暗色侧导航"/>
            <div className="bg-on-surface p-3 flex gap-3">
              <div className="w-20 border-r border-dark-outline-variant pr-1.5 space-y-0.5">{['WORKS','ABOUT','CONTACT'].map(x=><p key={x} className="font-mono-technical text-[7px] text-surface/60 uppercase tracking-widest">{x}</p>)}</div>
              <div className="flex-1"><p className="font-mono-technical text-[8px] text-surface/80">SYS.VER 2026.08</p></div>
            </div></B>
          {/* 34 DarkTopAppBar */}
          <B><H n="34" c="DARK TOP BAR / 暗色顶栏"/>
            <div className="bg-on-surface p-3 flex items-center justify-between border-b border-dark-outline-variant">
              <span className="font-mono-technical text-[9px] text-surface font-bold tracking-wider">DAIU/TERMINAL</span>
              <div className="flex gap-3">{['FILE','EDIT','VIEW','HELP'].map(x=><span key={x} className="font-mono-technical text-[7px] text-surface/60 uppercase tracking-widest">{x}</span>)}</div>
            </div></B>
          {/* 35 DarkHeroTypographic */}
          <B><H n="35" c="DARK HERO / 暗色排版英雄"/>
            <div className="bg-on-surface p-4">
              <p style={{fontSize:'clamp(40px,6vw,80px)',fontWeight:900,lineHeight:.88,letterSpacing:'-.04em'}} className="text-surface heading-scanlines">DESIGN<br/>SYSTEM</p>
              <p className="font-mono-technical text-[9px] text-surface/60 mt-2">RADICAL HELVETICA-MODERNISM · V1.0</p>
            </div></B>
          {/* 36 TerminalBootPanel */}
          <B><H n="36" c="TERMINAL BOOT / 终端启动"/>
            <div className="bg-on-surface p-4">
              <div className="flex items-center gap-1.5 mb-3"><div className="w-2 h-2 rounded-full bg-red-500"/><div className="w-2 h-2 rounded-full bg-yellow-500"/><div className="w-2 h-2 rounded-full bg-green-500"/><span className="font-mono-technical text-[8px] text-surface/40 ml-2">terminal@daiu:~</span></div>
              <pre className="font-mono-technical text-[8px] text-surface/70 leading-relaxed">{`[ OK ] Initializing design system...
[ OK ] Loading 43 components...
[ OK ] Compiling TypeScript...
[ OK ] Build complete. <2s
$ ready _`}</pre>
            </div></B>
          {/* 37 CoordinatesStatus */}
          <B><H n="37" c="COORDINATES / 坐标状态"/>
            <div className="bg-on-surface p-3 font-mono-technical text-[8px] text-surface/60 space-y-0.5">
              <div className="flex justify-between"><span>X 1_024</span><span>Y 0_768</span></div>
              <div className="flex justify-between"><span>GRID 12_COL</span><span>GAP 0_PX</span></div>
              <div className="flex justify-between"><span>STATUS</span><span className="text-green-400">ONLINE</span></div>
            </div></B>
          {/* 38 BentoGridCells */}
          <B><H n="38" c="BENTO GRID / Bento网格"/>
            <div className="bg-on-surface p-3"><div className="grid grid-cols-4 gap-1">
              <div className="col-span-2 row-span-2 h-20 border border-dark-outline-variant flex items-center justify-center"><span className="font-mono-technical text-[7px] text-surface/60">2×2</span></div>
              <div className="h-10 border border-dark-outline-variant flex items-center justify-center"><span className="font-mono-technical text-[7px] text-surface/60">1</span></div>
              <div className="h-10 border border-dark-outline-variant flex items-center justify-center"><span className="font-mono-technical text-[7px] text-surface/60">2</span></div>
              <div className="h-10 border border-dark-outline-variant flex items-center justify-center"><span className="font-mono-technical text-[7px] text-surface/60">3</span></div>
              <div className="h-10 border border-dark-outline-variant flex items-center justify-center"><span className="font-mono-technical text-[7px] text-surface/60">4</span></div>
            </div></div></B>
          {/* 39 SystemLogTable */}
          <B><H n="39" c="SYSTEM LOG / 日志表"/>
            <div className="bg-on-surface p-3 font-mono-technical text-[7px]">
              <div className="flex justify-between text-surface/40 mb-2 border-b border-dark-outline-variant pb-1"><span>TIME</span><span>EVENT</span><span>STATUS</span></div>
              {[['14:32:01','BUILD_START','OK'],['14:32:02','TSC_CHECK','PASS'],['14:32:03','VITE_BUILD','OK']].map((r,i)=>(<div key={i} className="flex justify-between text-surface/70 py-0.5"><span>{r[0]}</span><span>{r[1]}</span><span className="text-green-400">{r[2]}</span></div>))}</div></B>
          {/* 40 IconSquareGrid */}
          <B><H n="40" c="ICON GRID / 图标网格"/>
            <div className="bg-on-surface p-3"><div className="grid grid-cols-4 gap-px bg-dark-outline-variant">
              {Array.from({length:8}).map((_,i)=>(<div key={i} className="aspect-square bg-dark-surface-container flex items-center justify-center"><span className="font-mono-technical text-[9px] text-surface/40">{String(i+1).padStart(2,'0')}</span></div>))}</div></div></B>
          {/* 41 DarkFooter */}
          <B><H n="41" c="DARK FOOTER / 暗色页脚"/>
            <div className="bg-on-surface p-3">
              <div className="flex items-center justify-between pb-2 border-b border-dark-outline-variant">
                <span className="font-mono-technical text-[8px] text-surface font-bold tracking-widest">©2026 AIGC_CORE</span>
                <span className="font-mono-technical text-[7px] text-surface/40">SYSTEM OK</span>
              </div>
              <div className="flex justify-between mt-2">{['GitHub','Email','WeChat'].map(x=><span key={x} className="font-mono-technical text-[7px] text-surface/50 uppercase tracking-widest">{x}</span>)}</div>
            </div></B>
          {/* 42 ScanlinesCRTEffect */}
          <B><H n="42" c="CRT SCANLINES / 扫描线效果"/>
            <div className="bg-on-surface p-4 relative overflow-hidden">
              <div className="curtain-texture absolute inset-0" aria-hidden="true" />
              <p style={{fontSize:'clamp(18px,2.5vw,28px)',fontWeight:900,lineHeight:.9}} className="text-surface relative">SCAN<br/>LINES</p>
              <p className="font-mono-technical text-[7px] text-surface/50 mt-2 relative">repeating-linear-gradient · 4px周期</p>
            </div></B>
          {/* 43 DarkGridBackground */}
          <B><H n="43" c="DARK GRID / 暗色网格背景"/>
            <div className="bg-on-surface p-4 relative overflow-hidden">
              <div className="absolute inset-0" aria-hidden="true"
                style={{ backgroundImage:'linear-gradient(to right, rgba(203,190,255,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(203,190,255,0.10) 1px, transparent 1px)', backgroundSize:'22px 22px' }} />
              <p style={{fontSize:'clamp(20px,3vw,34px)',fontWeight:900,lineHeight:.9}} className="text-surface relative">GRID<br/>22PX</p>
            </div></B>
        </div>

        {/* ══════ Text Effects ══════ */}
        <div className="flex items-center gap-3 mt-5 mb-1">
          <span className="font-mono-technical text-[8px] text-brand-accent font-bold uppercase tracking-widest">Text Effects</span>
          <span className="flex-1 h-px bg-outline-variant" /></div>
        <B><H n="FX" c="LETTERPRESS & SCANLINES / 文字特效"/>
          <div className="p-4 flex gap-8">
            <div><p style={{fontSize:'clamp(18px,2.5vw,28px)',fontWeight:900}} className="text-letterpress text-on-surface mb-1">LETTERPRESS</p><p className="text-[8px] text-on-surface-variant">feTurbulence + feDisplacementMap · 油墨凸起</p></div>
            <div><p className="text-headline-lg-mobile heading-scanlines text-on-surface mb-1">SCANLINES</p><p className="text-[8px] text-on-surface-variant">bg-clip:text 横纹·hover→紫色信号</p></div>
            <div><p className="text-headline-lg heading-scanlines text-brand-accent mb-1">SIGNAL</p><p className="text-[8px] text-on-surface-variant">紫色信号态·唯一非文字用色</p></div>
          </div></B>

      </div>
    </section>
  )
}
