import { Placeholder } from './Placeholder'

interface ImageFrameProps {
  src?: string
  caption: string
  aspect?: string
}

/** Single image in a Swiss geometric frame: 1px border, mono label below. */
function ImageFrame({ src, caption, aspect = '16/9' }: ImageFrameProps) {
  return (
    <div>
      <div className="overflow-hidden cursor-crosshair" style={{ maxHeight: '60vh' }}>
        {src
          ? <img src={src} alt={caption} className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-700" />
          : <Placeholder aspect={aspect} label={caption} />
        }
      </div>
      <p className="font-mono-technical text-mono-technical text-on-surface-variant mt-3">{caption}</p>
    </div>
  )
}

interface ImageShowcaseProps {
  label?: string
  images: Array<{ src?: string; caption: string; aspect?: string }>
  /** Grid columns: 2, 3, or 'auto' */
  columns?: 2 | 3 | 'auto'
}

/**
 * ImageShowcase — Swiss geometric image grid for embedding within narrative sections.
 * Uses clean rectangular frames + mono labels, consistent with the overall design language.
 */
export default function ImageShowcase({ label, images, columns = 3 }: ImageShowcaseProps) {
  if (!images.length) return null

  const colClass = columns === 2
    ? 'grid-cols-1 sm:grid-cols-2'
    : columns === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'

  return (
    <div className="mt-10 pt-8 border-t border-outline-variant">
      {label && (
        <p className="font-label-micro text-label-micro uppercase text-on-surface-variant mb-6 tracking-widest">
          {label}
        </p>
      )}
      <div className={`grid ${colClass} gap-6`}>
        {images.map((img, i) => (
          <ImageFrame
            key={i}
            src={img.src}
            caption={img.caption}
            aspect={img.aspect ?? '16/9'}
          />
        ))}
      </div>
    </div>
  )
}
