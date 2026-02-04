import { useState, useEffect } from 'react'
import { type Venue, type VenueBooking } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { XCircle } from '@phosphor-icons/react'

interface BlockTimeSlotDialogProps {
  open: boolean
  onClose: () => void
  onBlock: (booking: VenueBooking) => void
  venue: Venue
  timeSlot: { date: string; time: string } | null
}

export function BlockTimeSlotDialog({
  open,
  onClose,
  onBlock,
  venue,
  timeSlot
}: BlockTimeSlotDialogProps) {
  const [notes, setNotes] = useState('')
  const [duration, setDuration] = useState('90')

  useEffect(() => {
    if (!open) {
      setNotes('')
      setDuration('90')
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!timeSlot) return

    const durationMinutes = parseInt(duration)
    const [hours, minutes] = timeSlot.time.split(':').map(Number)
    const endHours = Math.floor((hours * 60 + minutes + durationMinutes) / 60)
    const endMinutes = (hours * 60 + minutes + durationMinutes) % 60
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`

    const booking: VenueBooking = {
      id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      venueId: venue.id,
      venueName: venue.name,
      date: timeSlot.date,
      startTime: timeSlot.time,
      endTime,
      status: 'blocked',
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString()
    }

    onBlock(booking)
  }

  if (!timeSlot) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle size={24} weight="duotone" className="text-destructive" />
            Blocca Slot Temporale
          </DialogTitle>
          <DialogDescription>
            Blocca questo slot per manutenzione o altri motivi. Lo slot non sarà disponibile per le prenotazioni.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Venue</Label>
            <Input value={venue.name} disabled />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input value={timeSlot.date} disabled />
            </div>
            <div className="space-y-2">
              <Label>Orario Inizio</Label>
              <Input value={timeSlot.time} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durata (minuti)</Label>
            <Input
              id="duration"
              type="number"
              min="30"
              step="30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note (opzionale)</Label>
            <Textarea
              id="notes"
              placeholder="Es: Manutenzione campo, evento privato..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button 
              type="submit"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Blocca Slot
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
