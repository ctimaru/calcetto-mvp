import { Star } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: number
  showValue?: boolean
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  showValue = false,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1)
    }
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, index) => {
          const filled = index < Math.floor(rating)
          const partial = index < rating && index >= Math.floor(rating)
          const fillPercentage = partial ? (rating - Math.floor(rating)) * 100 : 0

          return (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={!interactive}
              className={cn(
                'relative',
                interactive && 'cursor-pointer hover:scale-110 transition-transform',
                !interactive && 'cursor-default'
              )}
              type="button"
            >
              {partial ? (
                <span className="relative inline-block">
                  <Star size={size} weight="regular" className="text-border" />
                  <span
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${fillPercentage}%` }}
                  >
                    <Star size={size} weight="fill" className="text-secondary" />
                  </span>
                </span>
              ) : (
                <Star
                  size={size}
                  weight={filled ? 'fill' : 'regular'}
                  className={filled ? 'text-secondary' : 'text-border'}
                />
              )}
            </button>
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
