import { type SkillLevel } from './types'

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
