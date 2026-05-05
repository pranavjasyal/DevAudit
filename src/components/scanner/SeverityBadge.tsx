import type { Severity } from '@/types'

interface Props { severity: Severity; size?: 'sm' | 'md' }

export function SeverityBadge({ severity, size = 'sm' }: Props) {
  const classes: Record<Severity, string> = {
    CRITICAL: 'bg-red-500/15 text-red-400 border-red-500/25',
    HIGH:     'bg-orange-500/15 text-orange-400 border-orange-500/25',
    MEDIUM:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    LOW:      'bg-blue-500/15 text-blue-400 border-blue-500/25',
    INFO:     'bg-gray-500/15 text-gray-400 border-gray-500/25',
  }
  const px = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
  return (
    <span className={`${px} rounded border font-bold font-mono uppercase tracking-wide flex-shrink-0 ${classes[severity]}`}>
      {severity}
    </span>
  )
}
