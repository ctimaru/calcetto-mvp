export interface User {
  id: string
  email: string
  name: string
  age?: number
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'pro'
  homeCity: string
  role: 'player' | 'manager' | 'admin'
  createdAt: string
}

export interface Field {
  id: string
  name: string
  address: string
  city: string
  surfaceType: 'grass' | 'artificial' | 'indoor'
  capacity: number
  pricePerHour: number
  managerId?: string
  createdAt: string
}

export interface Match {
  id: string
  fieldId: string
  field?: Field
  city: string
  startTime: string
  durationMin: number
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'pro' | 'mixed'
  playersNeeded: number
  pricePerPlayer: number
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  createdBy: string
  createdAt: string
}

export interface Participation {
  id: string
  matchId: string
  userId: string
  user?: User
  status: 'pending_payment' | 'confirmed' | 'cancelled'
  createdAt: string
  paidAt?: string
}

export interface ChatMessage {
  id: string
  matchId: string
  userId: string
  user?: User
  message: string
  createdAt: string
}

export interface Payment {
  id: string
  participationId: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: string
  createdAt: string
  completedAt?: string
}
