import { SITE_CONFIG } from '@/config/site'

/**
 * Footer — copied from reference: 对位/code.html lines 450–462.
 */
export default function Footer() {
  return (
    <footer className="flex flex-col md:flex-row justify-between items-start md:items-center w-full px-margin-outer py-8 pb-safe bg-surface border-t border-outline transition-none mt-stack-lg gap-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
        <span className="font-mono-technical text-mono-technical text-on-surface font-black tracking-widest">
          ©2026 AIGC_CORE_LOGIC
        </span>
        <div className="flex gap-4">
          <a className="font-label-micro text-label-micro uppercase text-on-surface-variant scanlines-hover transition-none" href={SITE_CONFIG.owner.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a className="font-label-micro text-label-micro uppercase text-on-surface-variant scanlines-hover transition-none" href={`mailto:${SITE_CONFIG.owner.email}`}>Email</a>
        </div>
      </div>
      <div className="text-left md:text-right">
        <span className="font-mono-technical text-[10px] opacity-40 uppercase">
          System Status: Optimal / Pipeline Idle
        </span>
      </div>
    </footer>
  )
}
