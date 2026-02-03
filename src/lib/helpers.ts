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

export const getDefaultVenues = () => {
  return [
    {
      id: generateId(),
      name: 'Centro Sportivo San Siro',
      address: 'Via Piccolomini, 5',
      city: 'Milano',
      phone: '+39 02 4070707',
      rating: 4.5,
      totalReviews: 42
    },
    {
      id: generateId(),
      name: 'Campo Sempione',
      address: 'Viale Byron, 2',
      city: 'Milano',
      phone: '+39 02 3311456',
      rating: 4.2,
      totalReviews: 38
    },
    {
      id: generateId(),
      name: 'Arena Colosseo',
      address: 'Via dei Fori Imperiali, 1',
      city: 'Roma',
      phone: '+39 06 7009988',
      rating: 4.7,
      totalReviews: 65
    },
    {
      id: generateId(),
      name: 'Calcetto Roma Nord',
      address: 'Via Flaminia, 123',
      city: 'Roma',
      phone: '+39 06 3612345',
      rating: 4.3,
      totalReviews: 51
    },
    {
      id: generateId(),
      name: 'Stadio delle Alpi',
      address: 'Strada Altessano, 131',
      city: 'Torino',
      phone: '+39 011 3990900',
      rating: 4.1,
      totalReviews: 29
    },
    {
      id: generateId(),
      name: 'Torino Sports Center',
      address: 'Via Filadelfia, 88',
      city: 'Torino',
      phone: '+39 011 6634455',
      rating: 4.4,
      totalReviews: 33
    },
    {
      id: generateId(),
      name: 'Campo San Paolo',
      address: 'Piazzale Vincenzo Tecchio',
      city: 'Napoli',
      phone: '+39 081 2395623',
      rating: 4.6,
      totalReviews: 47
    },
    {
      id: generateId(),
      name: 'Napoli Calcio Center',
      address: 'Via Comunale Margherita, 808',
      city: 'Napoli',
      phone: '+39 081 7701122',
      rating: 4.0,
      totalReviews: 31
    },
    {
      id: generateId(),
      name: 'Piazzale Michelangelo',
      address: 'Viale Michelangelo, 1',
      city: 'Firenze',
      phone: '+39 055 2341234',
      rating: 4.8,
      totalReviews: 56
    },
    {
      id: generateId(),
      name: 'Firenze Football Club',
      address: 'Via Campo di Marte, 2',
      city: 'Firenze',
      phone: '+39 055 5500987',
      rating: 4.3,
      totalReviews: 44
    },
    {
      id: generateId(),
      name: 'Campo Maggiore',
      address: 'Via Andrea Costa, 174',
      city: 'Bologna',
      phone: '+39 051 6191111',
      rating: 4.4,
      totalReviews: 39
    },
    {
      id: generateId(),
      name: 'Bologna Arena Sports',
      address: 'Via dello Sport, 50',
      city: 'Bologna',
      phone: '+39 051 3331234',
      rating: 4.2,
      totalReviews: 35
    }
  ]
}
