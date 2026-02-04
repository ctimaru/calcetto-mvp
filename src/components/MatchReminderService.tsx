import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { type Match } from '@/lib/types'
import { notifyMatchReminder } from '@/lib/notifications'

const CHECK_INTERVAL = 5 * 60 * 1000

export function MatchReminderService() {
  const [matches] = useKV<Match[]>('matches', [])
  const [lastReminderCheck, setLastReminderCheck] = useKV<string>('last-reminder-check', '')

  useEffect(() => {
    const checkReminders = async () => {
      if (!matches || matches.length === 0) return

      const now = new Date()
      const nowTime = now.getTime()
      const oneHourFromNow = nowTime + (60 * 60 * 1000)

      const lastCheck = lastReminderCheck ? new Date(lastReminderCheck).getTime() : 0
      if (nowTime - lastCheck < CHECK_INTERVAL) {
        return
      }

      for (const match of matches) {
        if (match.status === 'cancelled') continue

        const matchDateTime = new Date(`${match.date}T${match.time}`)
        const matchTime = matchDateTime.getTime()

        if (matchTime > nowTime && matchTime <= oneHourFromNow) {
          const alreadySent = await window.spark.kv.get<string[]>('reminders-sent') || []
          
          if (!alreadySent.includes(match.id)) {
            await notifyMatchReminder(match)
            await window.spark.kv.set('reminders-sent', [...alreadySent, match.id])
          }
        }
      }

      setLastReminderCheck(now.toISOString())
    }

    checkReminders()

    const interval = setInterval(checkReminders, CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [matches, lastReminderCheck])

  return null
}
