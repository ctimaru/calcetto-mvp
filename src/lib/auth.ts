import { User } from './types'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  age: number
  location: string
  skillLevel: 'principiante' | 'intermedio' | 'avanzato'
  phone?: string
}

type UserRole = 'player' | 'manager' | 'admin'

export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false

  const permissions: Record<UserRole, string[]> = {
    player: [
      'match:view',
      'match:join',
      'match:leave',
      'match:chat',
      'profile:edit_own',
      'payment:make',
      'venue:rate',
    ],
    manager: [
      'match:view',
      'match:create',
      'match:edit_own',
      'match:cancel_own',
      'match:view_participants_own',
      'match:remove_participant_own',
      'venue:create',
      'venue:edit_own',
      'venue:view_bookings_own',
      'profile:edit_own',
    ],
    admin: [
      'match:view',
      'match:create',
      'match:edit_all',
      'match:cancel_all',
      'match:view_participants_all',
      'match:remove_participant_all',
      'user:view_all',
      'user:edit_all',
      'user:delete',
      'user:change_role',
      'venue:create',
      'venue:edit_all',
      'venue:delete',
      'venue:view_bookings_all',
      'payment:view_all',
      'payment:refund',
      'metrics:view',
      'profile:edit_own',
    ],
  }

  return permissions[user.role]?.includes(permission) || false
}

export const canAccessManagement = (user: User | null): boolean => {
  if (!user) return false
  return user.role === 'manager' || user.role === 'admin'
}

export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin'
}

export const isManager = (user: User | null): boolean => {
  return user?.role === 'manager'
}

export const isPlayer = (user: User | null): boolean => {
  return user?.role === 'player'
}

export const canEditMatch = (user: User | null, matchCreatorId: string): boolean => {
  if (!user) return false
  if (isAdmin(user)) return true
  if (isManager(user) && user.id === matchCreatorId) return true
  return false
}

export const canViewMatchParticipants = (user: User | null, matchCreatorId: string): boolean => {
  if (!user) return false
  if (isAdmin(user)) return true
  if (isManager(user) && user.id === matchCreatorId) return true
  return false
}

export const canEditVenue = (user: User | null, venueManagerId?: string): boolean => {
  if (!user) return false
  if (isAdmin(user)) return true
  if (isManager(user) && venueManagerId && user.id === venueManagerId) return true
  return false
}
