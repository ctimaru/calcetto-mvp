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

export interface Venue {
  id: string
  name: string
  address: string
  city: string
  phone: string
  coordinates?: {
    lat: number
    lng: number
  }
  rating?: number
  totalReviews?: number
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
