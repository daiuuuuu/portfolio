import { Link } from 'react-router-dom'

/**
 * NotFound — 404 page in Swiss modernist style.
 */
export default function NotFound() {
  return (
    <div className="px-margin-outer py-24 min-h-[60vh] flex flex-col justify-center">
      <p className="text-label-micro uppercase text-on-surface-variant tracking-widest mb-4">
        ERROR_404 / PAGE_NOT_FOUND
      </p>
      <h1
        className="uppercase tracking-tighter text-on-surface mb-8"
        style={{ fontSize: 'clamp(60px, 10vw, 120px)', lineHeight: 1 }}
      >
        404
      </h1>
      <p className="text-body-md text-on-surface-variant mb-8 max-w-sm">
        请求的页面不存在。The requested page could not be located in the archive.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-label-micro uppercase tracking-widest
                   px-6 py-3 border border-outline text-on-surface
                   hover:bg-on-surface hover:text-surface w-fit"
      >
        ← RETURN HOME
      </Link>
    </div>
  )
}
