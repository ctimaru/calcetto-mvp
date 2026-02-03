import { type SkillLevel } from '@/lib/types'
import { getSkillLevelLabel, getSkillLevelColor } from '@/lib/helpers'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SkillBadgeProps {
  level: SkillLevel
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SkillBadge({ level, className, size = 'md' }: SkillBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }

  return (
    <Badge
      className={cn(
        'font-medium uppercase tracking-wide',
        sizeClasses[size],
        getSkillLevelColor(level),
        className
      )}
    >
      {getSkillLevelLabel(level)}
    </Badge>
  )
}
