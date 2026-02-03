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
