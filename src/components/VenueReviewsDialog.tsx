import { type VenueReview, type Venue } from '@/lib/types'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { VenueReviewCard } from './VenueReviewCard'
import { StarRating } from './StarRating'
import { Progress } from '@/components/ui/progress'
import { Star } from '@phosphor-icons/react'

interface VenueReviewsDialogProps {
  venue: Venue | null
  reviews: VenueReview[]
  open: boolean
  onClose: () => void
  onHelpful?: (reviewId: string) => void
}

export function VenueReviewsDialog({ venue, reviews, open, onClose, onHelpful }: VenueReviewsDialogProps) {
  if (!venue) return null

  const venueReviews = reviews.filter((r) => r.venueId === venue.id)
  const avgRating = venue.rating || 0
  const totalReviews = venue.totalReviews || 0

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = venueReviews.filter((r) => Math.round(r.rating) === stars).length
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
    return { stars, count, percentage }
  })

  const avgAspects = venueReviews.reduce(
    (acc, review) => ({
      cleanliness: acc.cleanliness + review.aspects.cleanliness,
      quality: acc.quality + review.aspects.quality,
      facilities: acc.facilities + review.aspects.facilities,
      location: acc.location + review.aspects.location,
    }),
    { cleanliness: 0, quality: 0, facilities: 0, location: 0 }
  )

  if (venueReviews.length > 0) {
    avgAspects.cleanliness /= venueReviews.length
    avgAspects.quality /= venueReviews.length
    avgAspects.facilities /= venueReviews.length
    avgAspects.location /= venueReviews.length
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-3xl">{venue.name}</DialogTitle>
              <DialogDescription className="text-base">
                Recensioni e Valutazioni
              </DialogDescription>
            </DialogHeader>

            {totalReviews > 0 ? (
              <div className="mt-6 space-y-6">
                <div className="bg-muted rounded-lg p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center justify-center md:border-r md:pr-6 min-w-[200px]">
                      <div className="text-5xl font-bold text-foreground mb-2">
                        {avgRating.toFixed(1)}
                      </div>
                      <StarRating rating={avgRating} size={24} className="mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {totalReviews} {totalReviews === 1 ? 'recensione' : 'recensioni'}
                      </p>
                    </div>

                    <div className="flex-1 space-y-2">
                      {ratingDistribution.map(({ stars, count, percentage }) => (
                        <div key={stars} className="flex items-center gap-2">
                          <div className="flex items-center gap-1 w-16">
                            <span className="text-sm font-medium">{stars}</span>
                            <Star size={14} weight="fill" className="text-secondary" />
                          </div>
                          <div className="flex-1 min-w-[100px]">
                            <Progress 
                              value={percentage} 
                              className="h-2 [&>[data-slot=progress-indicator]]:bg-secondary" 
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Pulizia</p>
                      <StarRating rating={avgAspects.cleanliness} size={16} className="justify-center" />
                      <p className="text-sm font-semibold mt-1">{avgAspects.cleanliness.toFixed(1)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Qualità</p>
                      <StarRating rating={avgAspects.quality} size={16} className="justify-center" />
                      <p className="text-sm font-semibold mt-1">{avgAspects.quality.toFixed(1)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Servizi</p>
                      <StarRating rating={avgAspects.facilities} size={16} className="justify-center" />
                      <p className="text-sm font-semibold mt-1">{avgAspects.facilities.toFixed(1)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Posizione</p>
                      <StarRating rating={avgAspects.location} size={16} className="justify-center" />
                      <p className="text-sm font-semibold mt-1">{avgAspects.location.toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Tutte le Recensioni</h4>
                  {venueReviews.map((review) => (
                    <VenueReviewCard key={review.id} review={review} onHelpful={onHelpful} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Star size={48} weight="thin" className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nessuna recensione ancora</h3>
                <p className="text-muted-foreground">
                  Sii il primo a recensire questo campo dopo aver giocato una partita!
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
