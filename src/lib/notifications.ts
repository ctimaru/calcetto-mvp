import { type Notification, type NotificationType, type Match, type User } from './types'
import { generateId } from './helpers'
import { toast } from 'sonner'

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Notification['metadata'],
  matchId?: string
): Promise<Notification> {
  const notification: Notification = {
    id: generateId(),
    userId,
    type,
    title,
    message,
    matchId,
    read: false,
    timestamp: new Date().toISOString(),
    metadata
  }

  const notifications = await window.spark.kv.get<Notification[]>('notifications') || []
  await window.spark.kv.set('notifications', [...notifications, notification])

  return notification
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const notifications = await window.spark.kv.get<Notification[]>('notifications') || []
  return notifications
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const notifications = await window.spark.kv.get<Notification[]>('notifications') || []
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  )
  await window.spark.kv.set('notifications', updated)
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const notifications = await window.spark.kv.get<Notification[]>('notifications') || []
  const updated = notifications.map(n => 
    n.userId === userId ? { ...n, read: true } : n
  )
  await window.spark.kv.set('notifications', updated)
}

export async function getUnreadCount(userId: string): Promise<number> {
  const notifications = await window.spark.kv.get<Notification[]>('notifications') || []
  return notifications.filter(n => n.userId === userId && !n.read).length
}

export async function notifyMatchCreated(match: Match, creator: User): Promise<void> {
  await createNotification(
    creator.id,
    'match_created',
    'Partita Creata con Successo',
    `La tua partita per il ${new Date(match.date).toLocaleDateString('it-IT')} alle ${match.time} è stata creata.`,
    {
      venueName: match.venue.name,
      matchDate: match.date,
      matchTime: match.time
    },
    match.id
  )

  toast.success('Partita creata! Notifica inviata.')
}

export async function notifyPlayerJoined(match: Match, player: User): Promise<void> {
  await createNotification(
    player.id,
    'match_joined',
    'Iscrizione Confermata',
    `Ti sei iscritto alla partita del ${new Date(match.date).toLocaleDateString('it-IT')} alle ${match.time}.`,
    {
      venueName: match.venue.name,
      matchDate: match.date,
      matchTime: match.time
    },
    match.id
  )

  for (const participant of match.participants) {
    if (participant.userId !== player.id) {
      await createNotification(
        participant.userId,
        'match_joined',
        'Nuovo Giocatore',
        `${player.firstName} ${player.lastName} si è unito alla partita.`,
        {
          venueName: match.venue.name,
          matchDate: match.date,
          matchTime: match.time
        },
        match.id
      )
    }
  }
}

export async function notifyMatchFull(match: Match): Promise<void> {
  for (const participant of match.participants) {
    await createNotification(
      participant.userId,
      'match_full',
      'Partita Completa!',
      `La partita del ${new Date(match.date).toLocaleDateString('it-IT')} alle ${match.time} è ora completa.`,
      {
        venueName: match.venue.name,
        matchDate: match.date,
        matchTime: match.time
      },
      match.id
    )
  }
}

export async function notifyMatchCancelled(match: Match, reason?: string): Promise<void> {
  for (const participant of match.participants) {
    await createNotification(
      participant.userId,
      'match_cancelled',
      'Partita Cancellata',
      `La partita del ${new Date(match.date).toLocaleDateString('it-IT')} alle ${match.time} è stata cancellata.${reason ? ` Motivo: ${reason}` : ''}`,
      {
        venueName: match.venue.name,
        matchDate: match.date,
        matchTime: match.time
      },
      match.id
    )
  }

  toast.info('Notifiche inviate a tutti i partecipanti')
}

export async function notifyBookingConflict(
  userId: string,
  venueName: string,
  date: string,
  time: string,
  conflictingMatchId: string
): Promise<void> {
  await createNotification(
    userId,
    'booking_conflict',
    'Conflitto Prenotazione Rilevato',
    `Attenzione: conflitto di prenotazione rilevato per ${venueName} il ${new Date(date).toLocaleDateString('it-IT')} alle ${time}.`,
    {
      venueName,
      matchDate: date,
      matchTime: time,
      conflictingMatchId
    }
  )

  toast.warning('Conflitto di prenotazione rilevato!')
}

export async function notifyMatchReminder(match: Match): Promise<void> {
  for (const participant of match.participants) {
    await createNotification(
      participant.userId,
      'match_reminder',
      'Promemoria Partita',
      `La tua partita inizia tra 1 ora! ${match.venue.name} - ${match.time}`,
      {
        venueName: match.venue.name,
        matchDate: match.date,
        matchTime: match.time
      },
      match.id
    )
  }
}

export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    match_created: '✅',
    match_joined: '👤',
    match_cancelled: '❌',
    match_full: '🎯',
    match_reminder: '⏰',
    booking_conflict: '⚠️',
    payment_received: '💳',
    payment_refunded: '💰'
  }
  return icons[type] || '📢'
}

export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    match_created: 'bg-green-500/10 border-green-500/20',
    match_joined: 'bg-blue-500/10 border-blue-500/20',
    match_cancelled: 'bg-red-500/10 border-red-500/20',
    match_full: 'bg-accent/10 border-accent/20',
    match_reminder: 'bg-yellow-500/10 border-yellow-500/20',
    booking_conflict: 'bg-orange-500/10 border-orange-500/20',
    payment_received: 'bg-green-500/10 border-green-500/20',
    payment_refunded: 'bg-blue-500/10 border-blue-500/20'
  }
  return colors[type] || 'bg-muted border-border'
}
