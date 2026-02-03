import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { StarRating } from './StarRating'
import { type Match } from '@/lib/types'

interface AddReviewDialogProps {
  match: Match | null
  open: boolean
  onClose: () => void
  onSubmit: (review: {
    rating: number
    comment: string
    aspects: {
      cleanliness: number
      quality: number
      facilities: number
      location: number
    }
  }) => void
}

export function AddReviewDialog({ match, open, onClose, onSubmit }: AddReviewDialogProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [cleanliness, setCleanliness] = useState(5)
  const [quality, setQuality] = useState(5)
  const [facilities, setFacilities] = useState(5)
  const [location, setLocation] = useState(5)

  const handleSubmit = () => {
    onSubmit({
      rating,
      comment,
      aspects: {
        cleanliness,
        quality,
        facilities,
        location,
      },
    })
    
    setRating(5)
    setComment('')
    setCleanliness(5)
    setQuality(5)
    setFacilities(5)
    setLocation(5)
    onClose()
  }

  if (!match) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Valuta il Campo</DialogTitle>
          <DialogDescription>
            Condividi la tua esperienza presso {match.venue.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Valutazione Generale</Label>
            <StarRating
              rating={rating}
              size={32}
              interactive
              onChange={setRating}
              showValue
              className="justify-center py-2"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-base font-semibold">Valutazioni Dettagliate</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Pulizia</Label>
                <StarRating
                  rating={cleanliness}
                  size={20}
                  interactive
                  onChange={setCleanliness}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Qualità del Campo</Label>
                <StarRating
                  rating={quality}
                  size={20}
                  interactive
                  onChange={setQuality}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Servizi (Spogliatoi, Docce)</Label>
                <StarRating
                  rating={facilities}
                  size={20}
                  interactive
                  onChange={setFacilities}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Posizione e Accesso</Label>
                <StarRating
                  rating={location}
                  size={20}
                  interactive
                  onChange={setLocation}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-base font-semibold">
              Commento (Facoltativo)
            </Label>
            <Textarea
              id="comment"
              placeholder="Descrivi la tua esperienza..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Pubblica Recensione
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
