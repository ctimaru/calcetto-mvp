import { type Match, type VenueBooking, type BookingConflict } from './types'
import { isTimeOverlap, addMinutesToTime } from './helpers'
import { notifyBookingConflict } from './notifications'

const MATCH_DURATION_MINUTES = 90

export async function checkBookingConflicts(
  venueId: string,
  date: string,
  startTime: string,
  excludeMatchId?: string
): Promise<BookingConflict | null> {
  const endTime = addMinutesToTime(startTime, MATCH_DURATION_MINUTES)

  const matches = await window.spark.kv.get<Match[]>('matches') || []
  const bookings = await window.spark.kv.get<VenueBooking[]>('venue-bookings') || []

  const conflictingMatches: string[] = []
  const conflictingBookings: string[] = []

  for (const match of matches) {
    if (match.id === excludeMatchId) continue
    if (match.venue.id !== venueId) continue
    if (match.date !== date) continue
    if (match.status === 'cancelled') continue

    const matchEndTime = addMinutesToTime(match.time, MATCH_DURATION_MINUTES)
    
    if (isTimeOverlap(startTime, endTime, match.time, matchEndTime)) {
      conflictingMatches.push(match.id)
    }
  }

  for (const booking of bookings) {
    if (booking.venueId !== venueId) continue
    if (booking.date !== date) continue
    if (booking.status === 'available') continue

    if (isTimeOverlap(startTime, endTime, booking.startTime, booking.endTime)) {
      conflictingBookings.push(booking.id)
    }
  }

  if (conflictingMatches.length > 0 || conflictingBookings.length > 0) {
    const venue = matches.find(m => m.venue.id === venueId)?.venue
    return {
      venueId,
      venueName: venue?.name || 'Campo sconosciuto',
      date,
      startTime,
      endTime,
      conflictingMatches,
      conflictingBookings
    }
  }

  return null
}

export async function createBookingWithConflictCheck(
  venueId: string,
  venueName: string,
  date: string,
  startTime: string,
  matchId?: string,
  userId?: string
): Promise<{ success: boolean; conflict?: BookingConflict; booking?: VenueBooking }> {
  const conflict = await checkBookingConflicts(venueId, date, startTime, matchId)

  if (conflict) {
    if (userId) {
      await notifyBookingConflict(userId, venueName, date, startTime, conflict.conflictingMatches[0] || '')
    }
    return { success: false, conflict }
  }

  const endTime = addMinutesToTime(startTime, MATCH_DURATION_MINUTES)
  
  const booking: VenueBooking = {
    id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    venueId,
    venueName,
    date,
    startTime,
    endTime,
    matchId,
    status: 'booked',
    bookedBy: userId,
    createdAt: new Date().toISOString()
  }

  const bookings = await window.spark.kv.get<VenueBooking[]>('venue-bookings') || []
  await window.spark.kv.set('venue-bookings', [...bookings, booking])

  return { success: true, booking }
}

export async function getConflictingMatches(conflict: BookingConflict): Promise<Match[]> {
  const matches = await window.spark.kv.get<Match[]>('matches') || []
  return matches.filter(m => conflict.conflictingMatches.includes(m.id))
}

export async function getConflictingBookings(conflict: BookingConflict): Promise<VenueBooking[]> {
  const bookings = await window.spark.kv.get<VenueBooking[]>('venue-bookings') || []
  return bookings.filter(b => conflict.conflictingBookings.includes(b.id))
}

export async function getVenueBookingsForDate(venueId: string, date: string): Promise<VenueBooking[]> {
  const bookings = await window.spark.kv.get<VenueBooking[]>('venue-bookings') || []
  return bookings
    .filter(b => b.venueId === venueId && b.date === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

export async function getVenueAvailableSlots(
  venueId: string,
  date: string,
  operatingStart: string = '08:00',
  operatingEnd: string = '23:00'
): Promise<{ startTime: string; endTime: string }[]> {
  const bookings = await getVenueBookingsForDate(venueId, date)
  const bookedBookings = bookings.filter(b => b.status === 'booked' || b.status === 'blocked')

  const slots: { startTime: string; endTime: string }[] = []
  let currentTime = operatingStart

  while (currentTime < operatingEnd) {
    const slotEnd = addMinutesToTime(currentTime, MATCH_DURATION_MINUTES)
    
    const hasConflict = bookedBookings.some(booking => 
      isTimeOverlap(currentTime, slotEnd, booking.startTime, booking.endTime)
    )

    if (!hasConflict && slotEnd <= operatingEnd) {
      slots.push({ startTime: currentTime, endTime: slotEnd })
    }

    currentTime = addMinutesToTime(currentTime, 60)
  }

  return slots
}

export function formatConflictMessage(conflict: BookingConflict): string {
  const parts: string[] = []
  
  if (conflict.conflictingMatches.length > 0) {
    parts.push(`${conflict.conflictingMatches.length} partita/e`)
  }
  
  if (conflict.conflictingBookings.length > 0) {
    parts.push(`${conflict.conflictingBookings.length} prenotazione/i`)
  }

  return `Conflitto rilevato con ${parts.join(' e ')} per ${conflict.venueName} il ${new Date(conflict.date).toLocaleDateString('it-IT')} dalle ${conflict.startTime} alle ${conflict.endTime}`
}
