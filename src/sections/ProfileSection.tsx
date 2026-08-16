import { SITE_CONFIG } from '@/config/site'

/**
 * ── Plan 2: 大字报数据宣言 ──────────────────────────────────
 * Typography IS the image. Chinese (system sans) and English (Geologica 900)
 * coordinate via deliberate separation: English carries the display voice,
 * Chinese carries the narrative, mono carries the data.
 */

const DISPLAY = { fontFamily: 'Geologica, Inter, sans-serif', fontWeight: 900 as const, letterSpacing: '-0.03em' }
const STATS_FONT = { fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 as const }

export default function ProfileSection() {

  return (
    <section id="profile" className="border-b border-outline" data-section="profile">

      {/* ━━━━━━━━ ABOUT · 海报大字 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

      <div className="border-b border-outline py-28 md:py-40">
        <div className="px-margin-outer max-w-6xl" data-reveal>

          {/* Giant name — English only, Geologica 900, extreme scale */}
          <h2
            className="text-on-surface leading-none mb-6"
            style={{ ...DISPLAY, fontSize: 'clamp(64px, 12vw, 160px)', lineHeight: 0.85 }}
          >
            KONG<br />DEYU
          </h2>
          <p
            className="text-on-surface-variant uppercase tracking-widest mb-12"
            style={{ fontSize: 'clamp(12px, 1.5vw, 16px)', fontWeight: 500 }}
          >
            {SITE_CONFIG.owner.role} · {SITE_CONFIG.owner.location}
          </p>

          {/* Two-column bio: Chinese left · English right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 mb-16">
            <div>
              <span className="font-mono-technical text-[10px] text-brand-accent uppercase tracking-widest block mb-4">
                // 中文
              </span>
              <p className="text-on-surface leading-relaxed"
                style={{ fontSize: 'clamp(14px, 1.1vw, 17px)', lineHeight: 1.9 }}>
                {SITE_CONFIG.about.zh}
              </p>
            </div>
            <div className="md:border-l md:border-outline-variant md:pl-16">
              <span className="font-mono-technical text-[10px] text-brand-accent uppercase tracking-widest block mb-4">
                // ENGLISH
              </span>
              <p className="text-on-surface-variant leading-relaxed"
                style={{ fontSize: 'clamp(14px, 1.1vw, 17px)', lineHeight: 1.9 }}>
                {SITE_CONFIG.about.en}
              </p>
            </div>
          </div>

          {/* Stats row — large mono numbers, full-bleed border grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 border border-outline mt-8"
               data-reveal data-reveal-group="about-stats">
            {SITE_CONFIG.aboutHighlights.map((h) => (
              <div key={h.label}
                className="p-5 md:p-7 border-r border-outline last:border-r-0
                           hover:bg-surface-container-low transition-none group">
                <p className="text-on-surface leading-none mb-1.5"
                  style={{ ...STATS_FONT, fontSize: 'clamp(36px, 5.5vw, 64px)' }}>
                  {h.label}
                </p>
                <p className="font-label-micro text-label-micro uppercase text-on-surface-variant tracking-widest">
                  {h.descEn}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ━━━━━━━━ EDUCATION · 紧凑过渡 ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

      <div className="border-b border-outline py-20 md:py-28" data-reveal>
        <div className="px-margin-outer grid grid-cols-12 gap-gutter">
          <div className="col-span-12 md:col-span-3">
            <span className="font-mono-technical text-on-surface-variant uppercase tracking-wider">
              {SITE_CONFIG.education.period}
            </span>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h3 className="text-on-surface uppercase tracking-tighter mb-1"
              style={{ ...DISPLAY, fontSize: 'clamp(28px, 3.5vw, 48px)' }}>
              {SITE_CONFIG.education.school}
            </h3>
            <p className="text-label-micro uppercase text-on-surface-variant mb-2 tracking-widest">
              {SITE_CONFIG.education.major}
            </p>
            <p className="text-body-md text-body-md text-on-surface-variant leading-relaxed max-w-2xl">
              {SITE_CONFIG.education.note}
            </p>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━ EXPERIENCE · 水印年号 ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

      {SITE_CONFIG.experience.map((exp, idx) => (
        <div key={idx}
          className="border-b border-outline py-24 md:py-36 relative"
          data-reveal>

          {/* Watermark — the start year rendered at ~20vw, nearly invisible */}
          <div
            data-watermark
            className="absolute bottom-0 right-0 select-none pointer-events-none leading-none"
            style={{
              ...DISPLAY,
              fontSize: 'clamp(100px, 22vw, 300px)',
              color: '#eae7e7',
              opacity: 0.10,
              transform: 'translateY(8%)',
            }}
            aria-hidden="true"
          >
            {exp.period.split(' ')[0]}
          </div>

          <div className="px-margin-outer relative z-10">
            <span className="font-mono-technical text-mono-technical text-on-surface-variant uppercase mb-3 block tracking-widest">
              EXPERIENCE / 工作经历
            </span>

            <div className="grid grid-cols-12 gap-gutter mb-10">
              <div className="col-span-12 md:col-span-3">
                <p className="font-mono-technical text-on-surface-variant uppercase">{exp.period}</p>
              </div>
              <div className="col-span-12 md:col-span-9">
                <h3 className="text-on-surface uppercase tracking-tighter mb-1"
                  style={{ ...DISPLAY, fontSize: 'clamp(32px, 5vw, 56px)' }}>
                  {exp.company}
                </h3>
                <p className="text-label-micro uppercase text-on-surface-variant mb-6 tracking-widest">
                  {exp.role}
                </p>
              </div>
            </div>

            <div className="max-w-3xl">
              <p className="text-body-md text-body-md text-on-surface-variant leading-relaxed mb-8">
                {exp.description}
              </p>

              <div className="border border-outline p-5 md:p-7">
                <p className="font-mono-technical text-[10px] text-brand-accent uppercase tracking-widest mb-5">
                  // KEY RESPONSIBILITIES
                </p>
                <ul className="space-y-4">
                  {exp.highlights.map((item, i) => (
                    <li key={i}
                      className="flex items-start gap-4 text-body-md text-body-md text-on-surface leading-relaxed">
                      <span className="font-mono-technical text-[11px] text-brand-accent mt-0.5 flex-shrink-0 font-bold">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ━━━━━━━━ SKILLS · 技能栈 ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

      {/* Vertical padding capped so the section stays within one screen. */}
      <div className="py-14 md:py-20">
        <div className="px-margin-outer" data-reveal data-reveal-group="skills">
          <span className="font-mono-technical text-[10px] text-brand-accent uppercase tracking-widest block mb-8 md:mb-10">
            // SKILLS · 技能栈
          </span>

          {/* Numbered directory list — no outer frame, no column separators.
              Only the per-row underline stays, so the four skill stacks read
              as a clean ledger. */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {SITE_CONFIG.skills.map((group) => (
              <div
                key={group.category}
                className="px-6 py-6 md:px-7 md:py-7"
              >
                  <p className="font-mono-technical text-[10px] text-brand-accent uppercase tracking-widest mb-5 md:mb-6">
                    {group.category}
                  </p>
                  <ul>
                    {group.items.map((skill, i) => (
                      <li
                        key={skill}
                        className="flex items-baseline gap-5 py-2 md:py-2.5 border-b border-outline-variant last:border-b-0 transition-none hover:bg-surface-container-low"
                      >
                        <span className="font-mono-technical text-[11px] text-brand-accent leading-none flex-shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className="text-on-surface uppercase leading-none"
                          style={{ ...DISPLAY, fontWeight: 400, fontSize: 'clamp(7.11px, 1.07vw, 16.89px)' }}
                        >
                          {skill}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
        </div>
      </div>

    </section>
  )
}
