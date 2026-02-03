export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'

export interface Venue {
  id: string
  name: string
  address: string
  city: string
  rating?: number
  reviewCount?: number
}

export interface Match {
  id: string
  venue: Venue
  date: string
  time: string
  duration: number
  skillLevel: SkillLevel
  currentPlayers: number
  maxPlayers: number
  pricePerPlayer: number
  description?: string
  organizer: {
    id: string
    name: string
    avatar?: string
  }
}
