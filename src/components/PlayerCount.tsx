import { Users } from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'

interface PlayerCountProps {
  current: number
  total: number
  showProgress?: boolean
}

export function PlayerCount({ current, total, showProgress = true }: PlayerCountProps) {
  const percentage = (current / total) * 100
  const isFull = current >= total

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Users size={20} weight="fill" className="text-primary" />
        <span className={`font-semibold text-lg ${isFull ? 'text-destructive' : 'text-foreground'}`}>
          {current}/{total}
        </span>
      </div>
      {showProgress && (
        <div className="flex-1 min-w-[80px]">
          <Progress value={percentage} className="h-2" />
        </div>
      )}
    </div>
  )
}
