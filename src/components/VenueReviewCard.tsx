import { type VenueReview } from '@/lib/types'
import { StarRating } from './StarRating'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getRelativeTime } from '@/lib/helpers'
import { ThumbsUp } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface VenueReviewCardProps {
  review: VenueReview
  onHelpful?: (reviewId: string) => void
}

export function VenueReviewCard({ review, onHelpful }: VenueReviewCardProps) {
  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="mt-1">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {getInitials(review.userName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-semibold text-foreground">{review.userName}</p>
                <p className="text-xs text-muted-foreground">{getRelativeTime(review.timestamp)}</p>
              </div>
              <StarRating rating={review.rating} size={16} />
            </div>

            {review.comment && (
              <p className="text-sm text-foreground mb-3 leading-relaxed">{review.comment}</p>
            )}

            <Separator className="my-3" />

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Pulizia</span>
                <StarRating rating={review.aspects.cleanliness} size={14} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Qualità</span>
                <StarRating rating={review.aspects.quality} size={14} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Servizi</span>
                <StarRating rating={review.aspects.facilities} size={14} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Posizione</span>
                <StarRating rating={review.aspects.location} size={14} />
              </div>
            </div>

            {onHelpful && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => onHelpful(review.id)}
              >
                <ThumbsUp size={14} className="mr-1" />
                Utile {review.helpful > 0 && `(${review.helpful})`}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
