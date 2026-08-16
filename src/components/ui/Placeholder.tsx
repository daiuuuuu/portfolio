import { cn } from '@/utils/cn'

interface PlaceholderProps {
  /** Aspect ratio string, e.g. "16/9" or "4/3" */
  aspect?: string
  label?: string
  className?: string
}

/**
 * Placeholder — gray box for images not yet replaced.
 * Uses aspect-ratio CSS so it scales with its container.
 */
export function Placeholder({ aspect = '16/9', label, className }: PlaceholderProps) {
  return (
    <div
      className={cn('w-full bg-surface-container-high relative overflow-hidden', className)}
      style={{ aspectRatio: aspect }}
      aria-label={label ?? 'Image placeholder'}
      role="img"
    >
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(to right, #c5c7c9 1px, transparent 1px),' +
            'linear-gradient(to bottom, #c5c7c9 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {label && (
        <span className="absolute bottom-3 left-3 text-mono-technical text-on-surface-variant opacity-60 uppercase">
          {label}
        </span>
      )}
    </div>
  )
}
