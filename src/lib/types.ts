export type SkillLevel = 'principiante' | 'intermedio' | 'avanzato'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  age: number
  skillLevel: SkillLevel
  location: string
  joinedMatches: string[]
}

export interface VenueManager {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  venueIds: string[]
  createdAt: string
}

export interface Venue {
  id: string
  name: string
  address: string
  city: string
  phone: string
  managerId?: string
  managerName?: string
  coordinates?: {
    lat: number
    lng: number
  }
  rating?: number
  totalReviews?: number
  operatingHours?: {
    start: string
    end: string
  }
  pricePerHour?: number
}

export interface VenueBooking {
  id: string
  venueId: string
  venueName: string
  date: string
  startTime: string
  endTime: string
  matchId?: string
  status: 'available' | 'booked' | 'blocked'
  bookedBy?: string
  bookedByName?: string
  notes?: string
  createdAt: string
}

export interface VenueReview {
  id: string
  venueId: string
  userId: string
  userName: string
  matchId: string
  rating: number
  comment: string
  aspects: {
    cleanliness: number
    quality: number
    facilities: number
    location: number
  }
  timestamp: string
  helpful: number
}

export interface Match {
  id: string
  date: string
  time: string
  venue: Venue
  totalPlayers: number
  currentPlayers: number
  skillLevel: SkillLevel
  price: number
  status: 'open' | 'full' | 'cancelled'
  participants: Participant[]
  createdBy: string
}

export interface Participant {
  userId: string
  firstName: string
  lastName: string
  skillLevel: SkillLevel
  joinedAt: string
  paid: boolean
}

export interface ChatMessage {
  id: string
  matchId: string
  userId: string
  userName: string
  message: string
  timestamp: string
}

export type TransactionType = 'payment' | 'refund' | 'cancellation_fee' | 'bonus'
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Transaction {
  id: string
  userId: string
  matchId?: string
  type: TransactionType
  status: TransactionStatus
  amount: number
  description: string
  timestamp: string
  paymentMethod?: 'card' | 'paypal' | 'bank_transfer'
  cardLast4?: string
  relatedTransactionId?: string
  metadata?: {
    venueName?: string
    matchDate?: string
    matchTime?: string
    refundReason?: string
  }
}

export type NotificationType = 
  | 'match_created' 
  | 'match_joined' 
  | 'match_cancelled' 
  | 'match_full' 
  | 'match_reminder' 
  | 'booking_conflict'
  | 'payment_received'
  | 'payment_refunded'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  matchId?: string
  read: boolean
  timestamp: string
  actionUrl?: string
  metadata?: {
    venueName?: string
    matchDate?: string
    matchTime?: string
    conflictingMatchId?: string
  }
}

export interface BookingConflict {
  venueId: string
  venueName: string
  date: string
  startTime: string
  endTime: string
  conflictingMatches: string[]
  conflictingBookings: string[]
}
