import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { type Notification } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetTrigger 
} from '@/components/ui/sheet'
import { Bell, Check, CheckCircle } from '@phosphor-icons/react'
import { getNotificationIcon, getNotificationColor, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notifications'
import { getRelativeTime } from '@/lib/helpers'
import { motion, AnimatePresence } from 'framer-motion'

interface NotificationsPanelProps {
  userId: string
}

export function NotificationsPanel({ userId }: NotificationsPanelProps) {
  const [notifications] = useKV<Notification[]>('notifications', [])
  const [isOpen, setIsOpen] = useState(false)

  const userNotifications = (notifications || [])
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const unreadCount = userNotifications.filter(n => !n.read).length

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId)
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(userId)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative gap-2 hover:bg-primary/10">
          <Bell size={20} weight={unreadCount > 0 ? 'fill' : 'regular'} />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1"
            >
              <Badge 
                className="h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            </motion.div>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell size={24} weight="duotone" className="text-primary" />
            Notifiche
          </SheetTitle>
          <SheetDescription>
            {unreadCount > 0 ? `${unreadCount} nuove notifiche` : 'Nessuna nuova notifica'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-2 mt-4 mb-4">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-2"
            >
              <CheckCircle size={16} weight="bold" />
              Segna tutte come lette
            </Button>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-3 pr-4">
            <AnimatePresence mode="popLayout">
              {userNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <Bell size={48} weight="thin" className="mx-auto mb-4 opacity-30" />
                  <p>Nessuna notifica</p>
                </motion.div>
              ) : (
                userNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <Card 
                      className={`border ${getNotificationColor(notification.type)} ${
                        !notification.read ? 'border-l-4 border-l-accent' : ''
                      } transition-all hover:shadow-md cursor-pointer`}
                      onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="text-2xl flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className={`font-semibold text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMarkAsRead(notification.id)
                                  }}
                                >
                                  <Check size={14} weight="bold" />
                                </Button>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            {notification.metadata && (
                              <div className="text-xs text-muted-foreground space-y-1">
                                {notification.metadata.venueName && (
                                  <div>📍 {notification.metadata.venueName}</div>
                                )}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-2">
                              {getRelativeTime(notification.timestamp)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
