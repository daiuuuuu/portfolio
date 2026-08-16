import { cn } from '@/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'outline' | 'dark'
  className?: string
}

/**
 * Badge — label-micro uppercase tag.
 * Used for project tags, section labels, source indicators.
 */
export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block text-label-micro uppercase border px-1.5 py-0.5',
        {
          default:  'text-on-surface-variant border-outline-variant',
          accent:   'text-brand-accent border-brand-accent',
          outline:  'text-on-surface border-on-surface',
          dark:     'text-dark-on-surface border-dark-outline-variant bg-dark-surface',
        }[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
