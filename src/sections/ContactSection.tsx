import { SITE_CONFIG } from '@/config/site'

const CONTACT_ITEMS = [
  { label: 'EMAIL',  value: SITE_CONFIG.owner.email,  href: `mailto:${SITE_CONFIG.owner.email}` },
  { label: 'PHONE',  value: SITE_CONFIG.owner.phone,  href: `tel:${SITE_CONFIG.owner.phone}` },
  { label: 'WECHAT', value: SITE_CONFIG.owner.wechat },
  { label: 'QQ',     value: SITE_CONFIG.owner.qq },
]

export default function ContactSection() {
  return (
    <section id="contact" className="py-24 md:py-32" data-section="contact">
      <div className="w-full border border-outline p-8 md:p-16 flex flex-col md:flex-row
                   justify-between items-start md:items-end gap-8
                   hover:border-secondary group cursor-crosshair" data-reveal>
        <div>
          <h2 className="uppercase tracking-tighter text-on-surface group-scanlines-hover mb-4"
            style={{ fontSize: 'clamp(32px, 6vw, 80px)', lineHeight: 1 }}>
            LET'S<br />WORK
          </h2>
          <p className="text-body-md text-on-surface-variant max-w-sm mb-6">
            {SITE_CONFIG.tagline.zh}<br />
            <span className="text-on-surface-variant opacity-70">{SITE_CONFIG.tagline.en}</span>
          </p>
          <p className="text-label-micro uppercase text-on-surface-variant tracking-widest">
            AVAILABLE · 求职中 · {SITE_CONFIG.owner.location}
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-3">
          {CONTACT_ITEMS.map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="font-mono-technical text-mono-technical text-on-surface-variant w-16 text-right">
                {item.label}
              </span>
              {item.href ? (
                <a href={item.href} className="font-mono-technical text-mono-technical text-on-surface scanlines-hover transition-none">
                  {item.value}
                </a>
              ) : (
                <span className="font-mono-technical text-mono-technical text-on-surface">{item.value}</span>
              )}
            </div>
          ))}

          <a href={SITE_CONFIG.owner.github} target="_blank" rel="noopener noreferrer"
            className="text-label-micro uppercase tracking-widest px-6 py-3 mt-4
                       border border-outline text-on-surface
                       hover:bg-on-surface hover:text-surface
                       flex items-center gap-2">
            GITHUB ↗
          </a>
        </div>
      </div>
    </section>
  )
}
