import type { User, Field } from './types'

export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function euroFromCents(cents: number | null | undefined): string {
  if (cents == null) return '—'
  return (cents / 100).toFixed(2) + ' €'
}

export function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('it-IT', { dateStyle: 'medium' })
  } catch {
    return iso
  }
}

export function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('it-IT', { timeStyle: 'short' })
  } catch {
    return iso
  }
}

export function getUserInitials(user: User | { name: string }): string {
  const parts = user.name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return user.name.slice(0, 2).toUpperCase()
}

export function getSkillLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzato',
    pro: 'Pro',
    mixed: 'Misto'
  }
  return labels[level] || level
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Bozza',
    published: 'Pubblicata',
    cancelled: 'Annullata',
    completed: 'Completata',
    pending_payment: 'In attesa di pagamento',
    confirmed: 'Confermata'
  }
  return labels[status] || status
}

export function getSurfaceTypeLabel(surface: string): string {
  const labels: Record<string, string> = {
    grass: 'Erba naturale',
    artificial: 'Erba sintetica',
    indoor: 'Indoor'
  }
  return labels[surface] || surface
}

export function getDefaultFields(): Field[] {
  return [
    {
      id: 'field-1',
      name: 'Campo Centrale',
      address: 'Via Roma 123',
      city: 'Torino',
      surfaceType: 'grass',
      capacity: 22,
      pricePerHour: 8000,
      createdAt: new Date().toISOString()
    },
    {
      id: 'field-2',
      name: 'Arena Sports',
      address: 'Corso Vittorio 45',
      city: 'Torino',
      surfaceType: 'artificial',
      capacity: 14,
      pricePerHour: 6000,
      createdAt: new Date().toISOString()
    },
    {
      id: 'field-3',
      name: 'Indoor Soccer Club',
      address: 'Via Garibaldi 78',
      city: 'Milano',
      surfaceType: 'indoor',
      capacity: 10,
      pricePerHour: 7000,
      createdAt: new Date().toISOString()
    }
  ]
}

export async function generateMockUsers(count: number = 10): Promise<User[]> {
  const firstNames = ['Marco', 'Luca', 'Andrea', 'Giuseppe', 'Francesco', 'Alessandro', 'Giovanni', 'Roberto', 'Paolo', 'Matteo']
  const lastNames = ['Rossi', 'Bianchi', 'Verdi', 'Neri', 'Russo', 'Ferrari', 'Esposito', 'Romano', 'Colombo', 'Ricci']
  const cities = ['Torino', 'Milano', 'Roma', 'Napoli', 'Bologna']
  const skillLevels: Array<'beginner' | 'intermediate' | 'advanced' | 'pro'> = ['beginner', 'intermediate', 'advanced', 'pro']
  
  const users: User[] = []
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`
    
    users.push({
      id: `user-${i + 1}`,
      email,
      name: `${firstName} ${lastName}`,
      age: 18 + Math.floor(Math.random() * 30),
      skillLevel: skillLevels[Math.floor(Math.random() * skillLevels.length)],
      homeCity: cities[Math.floor(Math.random() * cities.length)],
      role: i === 0 ? 'admin' : i <= 2 ? 'manager' : 'player',
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  
  return users
}
