import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { type Venue, type VenueBooking, type Match } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar as CalendarIcon,
  CaretLeft,
  CaretRight,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  MinusCircle,
  Buildings
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, addDays, startOfWeek, addWeeks, isSameDay, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { BlockTimeSlotDialog } from '@/components/BlockTimeSlotDialog'

interface VenueAvailabilityCalendarProps {
  venue: Venue
  onClose: () => void
}

export function VenueAvailabilityCalendar({ venue, onClose }: VenueAvailabilityCalendarProps) {
  const [bookings, setBookings] = useKV<VenueBooking[]>('venue-bookings', [])
  const [matches] = useKV<Match[]>('matches', [])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week')
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: string; time: string } | null>(null)

  const operatingStart = venue.operatingHours?.start || '08:00'
  const operatingEnd = venue.operatingHours?.end || '23:00'

  const timeSlots = useMemo(() => {
    const slots: string[] = []
    const [startHour] = operatingStart.split(':').map(Number)
    const [endHour] = operatingEnd.split(':').map(Number)
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }, [operatingStart, operatingEnd])

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [selectedDate])

  const displayDays = viewMode === 'week' ? weekDays : [selectedDate]

  const getBookingForSlot = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return bookings?.find(
      b => b.venueId === venue.id && 
           b.date === dateStr && 
           b.startTime === time
    )
  }

  const getMatchForSlot = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return matches?.find(
      m => m.venue.id === venue.id && 
           m.date === dateStr && 
           m.time === time
    )
  }

  const getSlotStatus = (date: Date, time: string): 'available' | 'booked' | 'blocked' => {
    const booking = getBookingForSlot(date, time)
    if (booking) return booking.status
    
    const match = getMatchForSlot(date, time)
    if (match) return 'booked'
    
    return 'available'
  }

  const handlePreviousWeek = () => {
    setSelectedDate(prev => addWeeks(prev, -1))
  }

  const handleNextWeek = () => {
    setSelectedDate(prev => addWeeks(prev, 1))
  }

  const handleSlotClick = (date: Date, time: string) => {
    const status = getSlotStatus(date, time)
    const dateStr = format(date, 'yyyy-MM-dd')
    
    if (status === 'blocked') {
      const booking = getBookingForSlot(date, time)
      if (booking) {
        setBookings(currentBookings => 
          (currentBookings || []).filter(b => b.id !== booking.id)
        )
        toast.success('Slot sbloccato')
      }
    } else if (status === 'available') {
      setSelectedTimeSlot({ date: dateStr, time })
      setIsBlockDialogOpen(true)
    } else {
      const match = getMatchForSlot(date, time)
      if (match) {
        toast.info(`Partita prenotata: ${match.participants.length}/${match.totalPlayers} giocatori`)
      }
    }
  }

  const handleBlockTimeSlot = (booking: VenueBooking) => {
    setBookings(currentBookings => [...(currentBookings || []), booking])
    setIsBlockDialogOpen(false)
    setSelectedTimeSlot(null)
    toast.success('Slot bloccato con successo')
  }

  const getStatusColor = (status: 'available' | 'booked' | 'blocked') => {
    switch (status) {
      case 'available':
        return 'bg-accent/20 hover:bg-accent/30 border-accent/40'
      case 'booked':
        return 'bg-primary/20 border-primary/40'
      case 'blocked':
        return 'bg-destructive/20 border-destructive/40'
    }
  }

  const getStatusIcon = (status: 'available' | 'booked' | 'blocked') => {
    switch (status) {
      case 'available':
        return <CheckCircle size={16} weight="fill" className="text-accent" />
      case 'booked':
        return <Clock size={16} weight="fill" className="text-primary" />
      case 'blocked':
        return <XCircle size={16} weight="fill" className="text-destructive" />
    }
  }

  const getAvailabilityStats = () => {
    let available = 0
    let booked = 0
    let blocked = 0

    displayDays.forEach(date => {
      timeSlots.forEach(time => {
        const status = getSlotStatus(date, time)
        if (status === 'available') available++
        else if (status === 'booked') booked++
        else if (status === 'blocked') blocked++
      })
    })

    return { available, booked, blocked }
  }

  const stats = getAvailabilityStats()

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-primary/10"
              >
                <CaretLeft size={20} weight="bold" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Buildings size={28} weight="duotone" className="text-primary" />
                  {venue.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Calendario Disponibilità
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon size={18} weight="duotone" />
                    {format(selectedDate, 'dd MMM yyyy', { locale: it })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    locale={it}
                  />
                </PopoverContent>
              </Popover>
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'day' | 'week')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Giorno</SelectItem>
                  <SelectItem value="week">Settimana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-accent/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{stats.available}</div>
                    <div className="text-sm text-muted-foreground">Disponibili</div>
                  </div>
                  <CheckCircle size={32} weight="duotone" className="text-accent" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{stats.booked}</div>
                    <div className="text-sm text-muted-foreground">Prenotati</div>
                  </div>
                  <Clock size={32} weight="duotone" className="text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-destructive/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{stats.blocked}</div>
                    <div className="text-sm text-muted-foreground">Bloccati</div>
                  </div>
                  <MinusCircle size={32} weight="duotone" className="text-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {viewMode === 'week' && (
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousWeek}
              className="gap-2"
            >
              <CaretLeft size={16} weight="bold" />
              Settimana Precedente
            </Button>
            <div className="text-sm font-medium">
              {format(weekDays[0], 'dd MMM', { locale: it })} - {format(weekDays[6], 'dd MMM yyyy', { locale: it })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextWeek}
              className="gap-2"
            >
              Settimana Successiva
              <CaretRight size={16} weight="bold" />
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Griglia Disponibilità</CardTitle>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-accent/20 border border-accent/40" />
                  <span>Disponibile</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary/20 border border-primary/40" />
                  <span>Prenotato</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-destructive/20 border border-destructive/40" />
                  <span>Bloccato</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <div className="grid gap-1" style={{ gridTemplateColumns: `80px repeat(${displayDays.length}, minmax(120px, 1fr))` }}>
                  <div className="sticky left-0 bg-background z-10 p-2 font-semibold text-sm">
                    Orario
                  </div>
                  {displayDays.map((day) => (
                    <div key={day.toISOString()} className="p-2 text-center border-b border-border">
                      <div className="font-semibold text-sm">
                        {format(day, 'EEE', { locale: it })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(day, 'dd/MM', { locale: it })}
                      </div>
                    </div>
                  ))}

                  {timeSlots.map((time) => (
                    <>
                      <div key={`time-${time}`} className="sticky left-0 bg-background z-10 p-2 text-xs font-medium text-muted-foreground border-r border-border">
                        {time}
                      </div>
                      {displayDays.map((day) => {
                        const status = getSlotStatus(day, time)
                        const booking = getBookingForSlot(day, time)
                        const match = getMatchForSlot(day, time)
                        
                        return (
                          <motion.button
                            key={`${day.toISOString()}-${time}`}
                            onClick={() => handleSlotClick(day, time)}
                            className={`p-2 border rounded transition-all ${getStatusColor(status)} ${
                              status === 'available' ? 'cursor-pointer' : status === 'blocked' ? 'cursor-pointer' : 'cursor-default'
                            }`}
                            whileHover={status !== 'booked' ? { scale: 1.02 } : {}}
                            whileTap={status !== 'booked' ? { scale: 0.98 } : {}}
                          >
                            <div className="flex flex-col items-center gap-1">
                              {getStatusIcon(status)}
                              {status === 'booked' && match && (
                                <div className="text-xs font-medium">
                                  {match.participants.length}/{match.totalPlayers}
                                </div>
                              )}
                              {status === 'blocked' && booking?.notes && (
                                <div className="text-xs truncate max-w-full" title={booking.notes}>
                                  {booking.notes}
                                </div>
                              )}
                            </div>
                          </motion.button>
                        )
                      })}
                    </>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Istruzioni:</strong> Clicca su uno slot disponibile (verde) per bloccarlo. Clicca su uno slot bloccato (rosso) per sbloccarlo. Gli slot prenotati (blu) sono occupati da partite confermate.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <BlockTimeSlotDialog
        open={isBlockDialogOpen}
        onClose={() => {
          setIsBlockDialogOpen(false)
          setSelectedTimeSlot(null)
        }}
        onBlock={handleBlockTimeSlot}
        venue={venue}
        timeSlot={selectedTimeSlot}
      />
    </div>
  )
}
