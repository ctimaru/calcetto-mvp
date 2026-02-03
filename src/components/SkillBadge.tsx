import { type SkillLevel } from '@/lib/types'
import { getSkillLevelLabel, getSkillLevelColor } from '@/lib/helpers'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SkillBadgeProps {
  level: SkillLevel
  className?: string
}

export function SkillBadge({ level, className }: SkillBadgeProps) {
  return (
    <Badge
      className={cn(
        'font-medium uppercase text-xs tracking-wide',
        getSkillLevelColor(level),
        className
      )}
    >
      {getSkillLevelLabel(level)}
    </Badge>
  )
}
