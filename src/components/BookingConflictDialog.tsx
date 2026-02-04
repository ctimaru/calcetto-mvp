import { useEffect, useState } from 'react'
import { type BookingConflict, type Match, type VenueBooking } from '@/lib/types'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Warning, Calendar, Clock, MapPin } from '@phosphor-icons/react'
import { getConflictingMatches, getConflictingBookings, formatConflictMessage } from '@/lib/booking-conflicts'
import { formatDate } from '@/lib/helpers'

interface BookingConflictDialogProps {
  open: boolean
  onClose: () => void
  conflict: BookingConflict | null
  onProceedAnyway?: () => void
  onCancel?: () => void
}

export function BookingConflictDialog({ 
  open, 
  onClose, 
  conflict, 
  onProceedAnyway,
  onCancel 
}: BookingConflictDialogProps) {
  const [conflictingMatches, setConflictingMatches] = useState<Match[]>([])
  const [conflictingBookings, setConflictingBookings] = useState<VenueBooking[]>([])

  useEffect(() => {
    if (conflict) {
      loadConflicts()
    }
  }, [conflict])

  const loadConflicts = async () => {
    if (!conflict) return

    const matches = await getConflictingMatches(conflict)
    const bookings = await getConflictingBookings(conflict)
    setConflictingMatches(matches)
    setConflictingBookings(bookings)
  }

  if (!conflict) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2 text-orange-600">
            <Warning size={28} weight="fill" />
            Conflitto di Prenotazione Rilevato
          </DialogTitle>
          <DialogDescription>
            {formatConflictMessage(conflict)}
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-orange-500/50 bg-orange-500/10">
          <Warning size={20} weight="bold" className="text-orange-600" />
          <AlertDescription className="ml-2">
            Il sistema ha rilevato una sovrapposizione di orari. Rivedi i dettagli qui sotto prima di procedere.
          </AlertDescription>
        </Alert>

        <div className="space-y-6 my-4">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar size={20} weight="duotone" className="text-primary" />
              Dettagli Richiesta
            </h3>
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} weight="fill" className="text-muted-foreground" />
                  <span className="font-medium">{conflict.venueName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} weight="fill" className="text-muted-foreground" />
                  <span>{formatDate(conflict.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} weight="fill" className="text-muted-foreground" />
                  <span>{conflict.startTime} - {conflict.endTime}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {conflictingMatches.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Warning size={20} weight="duotone" className="text-orange-600" />
                Partite in Conflitto ({conflictingMatches.length})
              </h3>
              <div className="space-y-3">
                {conflictingMatches.map((match) => (
                  <Card key={match.id} className="border-orange-500/30 bg-orange-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} weight="fill" className="text-muted-foreground" />
                            <span className="font-medium text-sm">{match.venue.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar size={14} className="text-muted-foreground" />
                            <span>{formatDate(match.date)}</span>
                            <Clock size={14} className="text-muted-foreground ml-2" />
                            <span>{match.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {match.currentPlayers}/{match.totalPlayers} giocatori
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {match.skillLevel}
                            </Badge>
                            {match.status === 'full' && (
                              <Badge className="bg-red-500 text-white text-xs">Completa</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {conflictingBookings.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Warning size={20} weight="duotone" className="text-orange-600" />
                Prenotazioni in Conflitto ({conflictingBookings.length})
              </h3>
              <div className="space-y-3">
                {conflictingBookings.map((booking) => (
                  <Card key={booking.id} className="border-orange-500/30 bg-orange-500/5">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} weight="fill" className="text-muted-foreground" />
                          <span className="font-medium text-sm">{booking.venueName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={14} className="text-muted-foreground" />
                          <span>{formatDate(booking.date)}</span>
                          <Clock size={14} className="text-muted-foreground ml-2" />
                          <span>{booking.startTime} - {booking.endTime}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            booking.status === 'booked' 
                              ? 'bg-red-500/10 text-red-700 border-red-500/20' 
                              : 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
                          }`}
                        >
                          {booking.status === 'booked' ? 'Prenotato' : 'Bloccato'}
                        </Badge>
                        {booking.notes && (
                          <p className="text-xs text-muted-foreground mt-2">{booking.notes}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.()
              onClose()
            }}
            className="flex-1"
          >
            Annulla
          </Button>
          {onProceedAnyway && (
            <Button
              onClick={() => {
                onProceedAnyway()
                onClose()
              }}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              Procedi Comunque
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
