import { type SkillLevel, type Venue } from './types'

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

export const formatTime = (timeString: string): string => {
  return timeString
}

export const getSkillLevelLabel = (level: SkillLevel): string => {
  const labels = {
    principiante: 'Principiante',
    intermedio: 'Intermedio',
    avanzato: 'Avanzato',
  }
  return labels[level]
}

export const getSkillLevelColor = (level: SkillLevel): string => {
  const colors = {
    principiante: 'bg-green-500 text-white',
    intermedio: 'bg-yellow-500 text-black',
    avanzato: 'bg-red-500 text-white',
  }
  return colors[level]
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const formatRating = (rating: number): string => {
  return rating.toFixed(1)
}

export const getRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    return 'Oggi'
  } else if (diffInDays === 1) {
    return 'Ieri'
  } else if (diffInDays < 7) {
    return `${diffInDays} giorni fa`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks} ${weeks === 1 ? 'settimana' : 'settimane'} fa`
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return `${months} ${months === 1 ? 'mese' : 'mesi'} fa`
  } else {
    return formatDate(timestamp)
  }
}

export const formatTransactionType = (type: string): string => {
  const types: Record<string, string> = {
    payment: 'Pagamento',
    refund: 'Rimborso',
    cancellation_fee: 'Penale Cancellazione',
    bonus: 'Bonus'
  }
  return types[type] || type
}

export const formatTransactionStatus = (status: string): string => {
  const statuses: Record<string, string> = {
    pending: 'In Elaborazione',
    completed: 'Completato',
    failed: 'Fallito',
    refunded: 'Rimborsato'
  }
  return statuses[status] || status
}

export const getTransactionStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
    completed: 'bg-green-500/10 text-green-700 border-green-500/20',
    failed: 'bg-red-500/10 text-red-700 border-red-500/20',
    refunded: 'bg-blue-500/10 text-blue-700 border-blue-500/20'
  }
  return colors[status] || 'bg-gray-500/10 text-gray-700 border-gray-500/20'
}

export const parseTime = (timeString: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return { hours, minutes }
}

export const addMinutesToTime = (timeString: string, minutesToAdd: number): string => {
  const { hours, minutes } = parseTime(timeString)
  const totalMinutes = hours * 60 + minutes + minutesToAdd
  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMinutes = totalMinutes % 60
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
}

export const isTimeOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const s1 = parseTime(start1)
  const e1 = parseTime(end1)
  const s2 = parseTime(start2)
  const e2 = parseTime(end2)

  const start1Minutes = s1.hours * 60 + s1.minutes
  const end1Minutes = e1.hours * 60 + e1.minutes
  const start2Minutes = s2.hours * 60 + s2.minutes
  const end2Minutes = e2.hours * 60 + e2.minutes

  return (start1Minutes < end2Minutes && end1Minutes > start2Minutes)
}

export const getDefaultVenues = () => {
  return [
    {
      id: generateId(),
      name: 'Centro Sportivo San Siro',
      address: 'Via Piccolomini, 5',
      city: 'Milano',
      phone: '+39 02 4070707',
      rating: 4.5,
      totalReviews: 42,
      operatingHours: { start: '08:00', end: '23:00' },
      pricePerHour: 50
    },
    {
      id: generateId(),
      name: 'Campo Sempione',
      address: 'Viale Byron, 2',
      city: 'Milano',
      phone: '+39 02 3311456',
      rating: 4.2,
      totalReviews: 38,
      operatingHours: { start: '09:00', end: '22:00' },
      pricePerHour: 45
    },
    {
      id: generateId(),
      name: 'Arena Colosseo',
      address: 'Via dei Fori Imperiali, 1',
      city: 'Roma',
      phone: '+39 06 7009988',
      rating: 4.7,
      totalReviews: 65,
      operatingHours: { start: '08:00', end: '23:00' },
      pricePerHour: 60
    },
    {
      id: generateId(),
      name: 'Calcetto Roma Nord',
      address: 'Via Flaminia, 123',
      city: 'Roma',
      phone: '+39 06 3612345',
      rating: 4.3,
      totalReviews: 51,
      operatingHours: { start: '10:00', end: '22:00' },
      pricePerHour: 40
    },
    {
      id: generateId(),
      name: 'Stadio delle Alpi',
      address: 'Strada Altessano, 131',
      city: 'Torino',
      phone: '+39 011 3990900',
      rating: 4.1,
      totalReviews: 29,
      operatingHours: { start: '09:00', end: '23:00' },
      pricePerHour: 55
    },
    {
      id: generateId(),
      name: 'Torino Sports Center',
      address: 'Via Filadelfia, 88',
      city: 'Torino',
      phone: '+39 011 6634455',
      rating: 4.4,
      totalReviews: 33,
      operatingHours: { start: '08:00', end: '22:00' },
      pricePerHour: 48
    },
    {
      id: generateId(),
      name: 'Campo San Paolo',
      address: 'Piazzale Vincenzo Tecchio',
      city: 'Napoli',
      phone: '+39 081 2395623',
      rating: 4.6,
      totalReviews: 47,
      operatingHours: { start: '08:00', end: '23:00' },
      pricePerHour: 42
    },
    {
      id: generateId(),
      name: 'Napoli Calcio Center',
      address: 'Via Comunale Margherita, 808',
      city: 'Napoli',
      phone: '+39 081 7701122',
      rating: 4.0,
      totalReviews: 31,
      operatingHours: { start: '10:00', end: '22:00' },
      pricePerHour: 38
    },
    {
      id: generateId(),
      name: 'Piazzale Michelangelo',
      address: 'Viale Michelangelo, 1',
      city: 'Firenze',
      phone: '+39 055 2341234',
      rating: 4.8,
      totalReviews: 56,
      operatingHours: { start: '08:00', end: '23:00' },
      pricePerHour: 65
    },
    {
      id: generateId(),
      name: 'Firenze Football Club',
      address: 'Via Campo di Marte, 2',
      city: 'Firenze',
      phone: '+39 055 5500987',
      rating: 4.3,
      totalReviews: 44,
      operatingHours: { start: '09:00', end: '22:00' },
      pricePerHour: 52
    },
    {
      id: generateId(),
      name: 'Campo Maggiore',
      address: 'Via Andrea Costa, 174',
      city: 'Bologna',
      phone: '+39 051 6191111',
      rating: 4.4,
      totalReviews: 39,
      operatingHours: { start: '08:00', end: '23:00' },
      pricePerHour: 47
    },
    {
      id: generateId(),
      name: 'Bologna Arena Sports',
      address: 'Via dello Sport, 50',
      city: 'Bologna',
      phone: '+39 051 3331234',
      rating: 4.2,
      totalReviews: 35,
      operatingHours: { start: '10:00', end: '22:00' },
      pricePerHour: 43
    }
  ]
}
