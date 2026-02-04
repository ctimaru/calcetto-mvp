import { useKV } from '@github/spark/hooks'
import { type Venue, type VenueReview, type Match } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Star, 
  Users, 
  ChartBar,
  Calendar,
  TrendUp,
  Sparkle
} from '@phosphor-icons/react'
import { VenueReviewCard } from '@/components/VenueReviewCard'
import { formatRating } from '@/lib/helpers'

interface VenueStatsDialogProps {
  open: boolean
  venue: Venue | null
  onClose: () => void
}

export function VenueStatsDialog({ open, venue, onClose }: VenueStatsDialogProps) {
  const [reviews] = useKV<VenueReview[]>('venue-reviews', [])
  const [matches] = useKV<Match[]>('matches', [])

  if (!venue) return null

  const venueReviews = reviews?.filter(r => r.venueId === venue.id) || []
  const venueMatches = matches?.filter(m => m.venue.id === venue.id) || []

  const totalReviews = venueReviews.length
  const avgRating = totalReviews > 0
    ? venueReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: venueReviews.filter(r => Math.floor(r.rating) === stars).length,
    percentage: totalReviews > 0
      ? (venueReviews.filter(r => Math.floor(r.rating) === stars).length / totalReviews) * 100
      : 0,
  }))

  const avgAspects = totalReviews > 0
    ? {
        cleanliness: venueReviews.reduce((sum, r) => sum + r.aspects.cleanliness, 0) / totalReviews,
        quality: venueReviews.reduce((sum, r) => sum + r.aspects.quality, 0) / totalReviews,
        facilities: venueReviews.reduce((sum, r) => sum + r.aspects.facilities, 0) / totalReviews,
        location: venueReviews.reduce((sum, r) => sum + r.aspects.location, 0) / totalReviews,
      }
    : null

  const totalPlayers = venueMatches.reduce((sum, m) => sum + m.currentPlayers, 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ChartBar size={24} weight="duotone" className="text-primary" />
            Statistiche: {venue.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="space-y-6 pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-secondary/10">
                      <Star size={20} weight="duotone" className="text-secondary" />
                    </div>
                    <div className="text-2xl font-bold">{formatRating(avgRating)}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Rating Medio
                  </div>
                </CardContent>
              </Card>

              <Card className="border-accent/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Users size={20} weight="duotone" className="text-accent" />
                    </div>
                    <div className="text-2xl font-bold">{totalReviews}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Recensioni
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calendar size={20} weight="duotone" className="text-primary" />
                    </div>
                    <div className="text-2xl font-bold">{venueMatches.length}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Partite Totali
                  </div>
                </CardContent>
              </Card>
            </div>

            {totalReviews > 0 && (
              <>
                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendUp size={20} weight="duotone" />
                    Distribuzione Rating
                  </h3>
                  <div className="space-y-2">
                    {ratingDistribution.map(({ stars, count, percentage }) => (
                      <div key={stars} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <span className="text-sm font-medium">{stars}</span>
                          <Star size={14} weight="fill" className="text-secondary" />
                        </div>
                        <div className="flex-1">
                          <Progress value={percentage} className="h-2" />
                        </div>
                        <div className="w-12 text-right text-sm text-muted-foreground">
                          {count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sparkle size={20} weight="duotone" />
                    Valutazioni per Aspetto
                  </h3>
                  {avgAspects && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Pulizia</span>
                          <Badge variant="outline">{formatRating(avgAspects.cleanliness)}</Badge>
                        </div>
                        <Progress value={(avgAspects.cleanliness / 5) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Qualità</span>
                          <Badge variant="outline">{formatRating(avgAspects.quality)}</Badge>
                        </div>
                        <Progress value={(avgAspects.quality / 5) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Strutture</span>
                          <Badge variant="outline">{formatRating(avgAspects.facilities)}</Badge>
                        </div>
                        <Progress value={(avgAspects.facilities / 5) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Posizione</span>
                          <Badge variant="outline">{formatRating(avgAspects.location)}</Badge>
                        </div>
                        <Progress value={(avgAspects.location / 5) * 100} className="h-2" />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Recensioni Recenti</h3>
                  <div className="space-y-4">
                    {venueReviews.slice(0, 5).map((review) => (
                      <VenueReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {totalReviews === 0 && (
              <div className="text-center py-8">
                <Star size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nessuna recensione disponibile per questo venue
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
