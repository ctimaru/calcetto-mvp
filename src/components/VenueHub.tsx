import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { type Venue, type User, type VenueBooking, type Match, type VenueReview, type Notification } from '@/lib/types'
import { isAdmin, isManager } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Plus, 
  MagnifyingGlass,
  MapPin,
  Phone,
  Star,
  PencilSimple,
  Trash,
  Buildings,
  ChartBar,
  CalendarBlank,
  Bell,
  Check,
  CheckCircle,
  CurrencyDollar,
  SignOut,
  ShieldCheck
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { AddVenueDialog } from '@/components/AddVenueDialog'
import { EditVenueDialog } from '@/components/EditVenueDialog'
import { VenueStatsDialog } from '@/components/VenueStatsDialog'
import { VenueAvailabilityCalendar } from '@/components/VenueAvailabilityCalendar'
import { AdminPanel } from '@/components/AdminPanel'
import { getNotificationIcon, getNotificationColor, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notifications'
import { getRelativeTime } from '@/lib/helpers'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface VenueHubProps {
  onBack: () => void
  currentUser: User
  onLogout?: () => void
}

export function VenueHub({ onBack, currentUser, onLogout }: VenueHubProps) {
  const [venues, setVenues] = useKV<Venue[]>('venues', [])
  const [reviews] = useKV<VenueReview[]>('venue-reviews', [])
  const [notifications] = useKV<Notification[]>('notifications', [])
  const [matches] = useKV<Match[]>('matches', [])
  const [bookings] = useKV<VenueBooking[]>('venue-bookings', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)
  const [deletingVenue, setDeletingVenue] = useState<Venue | null>(null)
  const [statsVenue, setStatsVenue] = useState<Venue | null>(null)
  const [calendarVenue, setCalendarVenue] = useState<Venue | null>(null)
  const [activeTab, setActiveTab] = useState<'venues' | 'bookings' | 'reviews' | 'notifications' | 'admin'>('venues')

  const userIsAdmin = isAdmin(currentUser)
  const userIsManager = isManager(currentUser)

  const displayedVenues = userIsManager && !userIsAdmin
    ? venues?.filter(v => v.managerId === currentUser.id) || []
    : venues?.filter(venue => {
        const query = searchQuery.toLowerCase()
        return (
          venue.name.toLowerCase().includes(query) ||
          venue.city.toLowerCase().includes(query) ||
          venue.address.toLowerCase().includes(query)
        )
      }) || []

  const managerVenues = userIsManager ? displayedVenues : []

  const todayBookings = bookings?.filter(b => {
    const isManagerVenue = userIsManager && !userIsAdmin
      ? managerVenues.some(v => v.id === b.venueId)
      : true
    const isToday = b.date === new Date().toISOString().split('T')[0]
    return isManagerVenue && isToday
  }) || []

  const upcomingBookings = bookings?.filter(b => {
    const isManagerVenue = userIsManager && !userIsAdmin
      ? managerVenues.some(v => v.id === b.venueId)
      : true
    const isUpcoming = new Date(b.date) > new Date()
    return isManagerVenue && isUpcoming && b.status === 'booked'
  }) || []

  const totalRevenue = matches?.filter(m => 
    userIsManager && !userIsAdmin
      ? managerVenues.some(v => v.id === m.venue.id)
      : true
  ).reduce((sum, m) => sum + (m.price * m.currentPlayers), 0) || 0

  const relevantReviews = reviews?.filter(r => 
    userIsManager && !userIsAdmin
      ? managerVenues.some(v => v.id === r.venueId)
      : true
  ) || []

  const averageRating = relevantReviews.length > 0
    ? relevantReviews.reduce((sum, r) => sum + r.rating, 0) / relevantReviews.length
    : 0

  const handleAddVenue = async (venue: Venue) => {
    const venueWithManager = userIsManager
      ? {
          ...venue,
          managerId: currentUser.id,
          managerName: `${currentUser.firstName} ${currentUser.lastName}`
        }
      : venue

    setVenues(currentVenues => [...(currentVenues || []), venueWithManager])
    
    if (userIsManager) {
      const users = await window.spark.kv.get<User[]>('users') || []
      const updatedUsers = users.map(u => 
        u.id === currentUser.id 
          ? { ...u, venueIds: [...(u.venueIds || []), venue.id] }
          : u
      )
      await window.spark.kv.set('users', updatedUsers)
    }

    setIsAddDialogOpen(false)
    toast.success(`Venue "${venue.name}" aggiunto con successo`)
  }

  const handleEditVenue = (updatedVenue: Venue) => {
    setVenues(currentVenues =>
      (currentVenues || []).map(v => v.id === updatedVenue.id ? updatedVenue : v)
    )
    setEditingVenue(null)
    toast.success(`Venue "${updatedVenue.name}" aggiornato con successo`)
  }

  const handleDeleteVenue = () => {
    if (!deletingVenue) return
    
    setVenues(currentVenues =>
      (currentVenues || []).filter(v => v.id !== deletingVenue.id)
    )
    toast.success(`Venue "${deletingVenue.name}" eliminato`)
    setDeletingVenue(null)
  }

  const getVenueReviews = (venueId: string) => {
    return reviews?.filter(r => r.venueId === venueId) || []
  }

  const getCityStats = () => {
    const cityMap = new Map<string, number>()
    displayedVenues?.forEach(venue => {
      cityMap.set(venue.city, (cityMap.get(venue.city) || 0) + 1)
    })
    return Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
  }

  const venueRelatedNotifications = (notifications || [])
    .filter(n => {
      const isVenueNotification = n.type === 'booking_conflict' || n.metadata?.venueName
      if (!isVenueNotification) return false
      
      if (userIsManager && !userIsAdmin) {
        return managerVenues.some(v => v.name === n.metadata?.venueName)
      }
      
      return n.userId === currentUser.id
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const unreadNotificationsCount = venueRelatedNotifications.filter(n => !n.read).length

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId)
  }

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(currentUser.id)
  }

  const handleLogout = () => {
    toast.success('Logout effettuato con successo')
    onLogout?.()
  }

  if (calendarVenue) {
    return <VenueAvailabilityCalendar venue={calendarVenue} onClose={() => setCalendarVenue(null)} />
  }

  const cityStats = getCityStats()

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="hover:bg-primary/10"
              >
                <ArrowLeft size={20} weight="bold" />
              </Button>
              <Buildings size={32} weight="duotone" className="text-primary" />
              <div>
                <h1 className="text-xl font-bold">
                  {userIsManager ? 'Dashboard Management' : 'Management'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {userIsManager 
                    ? `${currentUser.firstName} ${currentUser.lastName}`
                    : `${displayedVenues?.length || 0} venue totali`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(!userIsManager || (userIsManager && venueRelatedNotifications.length > 0)) && (
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab('notifications')}
                  className="relative gap-2 hover:bg-primary/10"
                >
                  <Bell size={20} weight={unreadNotificationsCount > 0 ? 'fill' : 'regular'} />
                  {unreadNotificationsCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Badge 
                        className="h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                      >
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                      </Badge>
                    </motion.div>
                  )}
                </Button>
              )}
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              >
                <Plus size={20} weight="bold" />
                <span className="hidden sm:inline">Aggiungi Venue</span>
              </Button>
              {userIsManager && (
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="gap-2 hover:bg-primary/10 border-primary/30"
                >
                  <SignOut size={20} />
                  <span className="hidden sm:inline">Esci</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Buildings size={24} weight="duotone" className="text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{displayedVenues?.length || 0}</div>
                <div className="text-sm text-muted-foreground">
                  {userIsManager ? 'Venue Gestiti' : 'Venues Totali'}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-accent/20 hover:border-accent/40 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <CalendarBlank size={24} weight="duotone" className="text-accent" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{todayBookings.length}</div>
                <div className="text-sm text-muted-foreground">Prenotazioni Oggi</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-secondary/20 hover:border-secondary/40 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <Star size={24} weight="duotone" className="text-secondary" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {averageRating > 0 ? averageRating.toFixed(1) : '-'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Rating Medio ({relevantReviews.length} recensioni)
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <CurrencyDollar size={24} weight="duotone" className="text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">€{totalRevenue.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Revenue Totale</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className={`grid w-full max-w-3xl mx-auto mb-8 ${
            userIsAdmin ? 'grid-cols-5' : userIsManager ? 'grid-cols-4' : 'grid-cols-2'
          }`}>
            <TabsTrigger value="venues" className="gap-2">
              <Buildings size={18} weight="duotone" />
              Venues
            </TabsTrigger>
            {userIsManager && (
              <>
                <TabsTrigger value="bookings" className="gap-2">
                  <CalendarBlank size={18} weight="duotone" />
                  Prenotazioni
                </TabsTrigger>
                <TabsTrigger value="reviews" className="gap-2">
                  <Star size={18} weight="duotone" />
                  Recensioni
                </TabsTrigger>
              </>
            )}
            {userIsAdmin && (
              <TabsTrigger value="admin" className="gap-2">
                <ShieldCheck size={18} weight="duotone" />
                Admin
              </TabsTrigger>
            )}
            <TabsTrigger value="notifications" className="gap-2">
              <Bell size={18} weight="duotone" />
              Notifiche
              {unreadNotificationsCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                  {unreadNotificationsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="venues" className="space-y-8 mt-0">
            {!userIsManager && cityStats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ChartBar size={20} weight="duotone" />
                    Distribuzione per Città
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cityStats.map(({ city, count }) => (
                      <div key={city} className="flex items-center gap-3">
                        <div className="w-24 text-sm font-medium">{city}</div>
                        <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / (displayedVenues?.length || 1)) * 100}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="h-full bg-primary/70 rounded-full"
                          />
                        </div>
                        <div className="w-12 text-right text-sm font-bold">{count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-lg">
                    {userIsManager ? 'I Miei Venue' : 'Tutti i Venues'}
                  </CardTitle>
                  {!userIsManager && (
                    <div className="relative flex-1 max-w-md">
                      <MagnifyingGlass
                        size={20}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        type="text"
                        placeholder="Cerca per nome, città o indirizzo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {displayedVenues.length === 0 ? (
                  <div className="text-center py-12">
                    <Buildings size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? 'Nessun venue trovato' : 'Nessun venue disponibile'}
                    </p>
                    {!searchQuery && (
                      <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        <Plus size={20} weight="bold" className="mr-2" />
                        Aggiungi il Primo Venue
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className={`grid ${userIsManager ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-4`}>
                    {displayedVenues.map((venue, index) => {
                      const venueReviews = getVenueReviews(venue.id)
                      const venueBookings = bookings?.filter(b => b.venueId === venue.id && b.status === 'booked') || []
                      
                      return (
                        <motion.div
                          key={venue.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card className="hover:border-primary/30 transition-colors h-full">
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                                      <Buildings size={24} weight="duotone" className="text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-lg font-semibold mb-1 truncate">
                                        {venue.name}
                                      </h3>
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <Badge variant="outline" className="gap-1">
                                          <MapPin size={14} weight="fill" />
                                          {venue.city}
                                        </Badge>
                                        {venue.rating && (
                                          <Badge 
                                            variant="outline" 
                                            className="gap-1 border-secondary/30 bg-secondary/5"
                                          >
                                            <Star size={14} weight="fill" className="text-secondary" />
                                            {venue.rating.toFixed(1)}
                                            <span className="text-xs text-muted-foreground">
                                              ({venue.totalReviews || 0})
                                            </span>
                                          </Badge>
                                        )}
                                        {userIsManager && (
                                          <>
                                            <Badge variant="outline">{venueBookings.length} prenotazioni</Badge>
                                            <Badge variant="outline">{venueReviews.length} recensioni</Badge>
                                          </>
                                        )}
                                      </div>
                                      <div className="text-sm text-muted-foreground space-y-1">
                                        <div className="flex items-center gap-2">
                                          <MapPin size={16} weight="duotone" />
                                          {venue.address}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Phone size={16} weight="duotone" />
                                          {venue.phone}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2 shrink-0 flex-wrap">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCalendarVenue(venue)}
                                    className="hover:bg-accent/10 hover:border-accent/30"
                                    title="Calendario Disponibilità"
                                  >
                                    <CalendarBlank size={18} weight="duotone" />
                                  </Button>
                                  {venueReviews.length > 0 && (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => setStatsVenue(venue)}
                                      className="hover:bg-accent/10 hover:border-accent/30"
                                    >
                                      <ChartBar size={18} weight="duotone" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setEditingVenue(venue)}
                                    className="hover:bg-primary/10 hover:border-primary/30"
                                  >
                                    <PencilSimple size={18} weight="duotone" />
                                  </Button>
                                  {userIsAdmin && (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => setDeletingVenue(venue)}
                                      className="hover:bg-destructive/10 hover:border-destructive/30 text-destructive"
                                    >
                                      <Trash size={18} weight="duotone" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {userIsManager && (
            <>
              <TabsContent value="bookings">
                <Card>
                  <CardHeader>
                    <CardTitle>Prenotazioni Prossime</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      {upcomingBookings.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          Nessuna prenotazione futura
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {upcomingBookings.map((booking) => {
                            const venue = venues?.find(v => v.id === booking.venueId)
                            return (
                              <Card key={booking.id}>
                                <CardContent className="pt-6">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="font-semibold">{venue?.name}</h3>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {new Date(booking.date).toLocaleDateString('it-IT', {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {booking.startTime} - {booking.endTime}
                                      </p>
                                      {booking.bookedByName && (
                                        <p className="text-sm mt-2">
                                          Prenotato da: <span className="font-medium">{booking.bookedByName}</span>
                                        </p>
                                      )}
                                    </div>
                                    <Badge>{booking.status}</Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Recensioni dei Clienti</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      {relevantReviews.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          Nessuna recensione ancora
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {relevantReviews.map((review) => {
                            const venue = venues?.find(v => v.id === review.venueId)
                            return (
                              <Card key={review.id}>
                                <CardContent className="pt-6">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h3 className="font-semibold">{venue?.name}</h3>
                                      <p className="text-sm text-muted-foreground">{review.userName}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Star size={16} weight="fill" className="text-secondary" />
                                      <span className="font-bold">{review.rating}</span>
                                    </div>
                                  </div>
                                  <p className="text-sm">{review.comment}</p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {new Date(review.timestamp).toLocaleDateString('it-IT')}
                                  </p>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}

          <TabsContent value="notifications" className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bell size={24} weight="duotone" className="text-primary" />
                      Notifiche Venue
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {unreadNotificationsCount > 0 
                        ? `${unreadNotificationsCount} nuove notifiche` 
                        : 'Nessuna nuova notifica'}
                    </p>
                  </div>
                  {unreadNotificationsCount > 0 && (
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
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {venueRelatedNotifications.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="text-center py-12 text-muted-foreground"
                        >
                          <Bell size={48} weight="thin" className="mx-auto mb-4 opacity-30" />
                          <p>Nessuna notifica venue</p>
                        </motion.div>
                      ) : (
                        venueRelatedNotifications.map((notification, index) => (
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
                                          <div className="flex items-center gap-1">
                                            <MapPin size={12} weight="fill" />
                                            {notification.metadata.venueName}
                                          </div>
                                        )}
                                        {notification.metadata.matchDate && notification.metadata.matchTime && (
                                          <div className="flex items-center gap-1">
                                            <CalendarBlank size={12} weight="fill" />
                                            {new Date(notification.metadata.matchDate).toLocaleDateString('it-IT')} alle {notification.metadata.matchTime}
                                          </div>
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
              </CardContent>
            </Card>
          </TabsContent>

          {userIsAdmin && (
            <TabsContent value="admin">
              <AdminPanel currentUser={currentUser} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <AddVenueDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onVenueAdded={handleAddVenue}
      />

      <EditVenueDialog
        open={!!editingVenue}
        venue={editingVenue}
        onClose={() => setEditingVenue(null)}
        onVenueUpdated={handleEditVenue}
      />

      <VenueStatsDialog
        open={!!statsVenue}
        venue={statsVenue}
        onClose={() => setStatsVenue(null)}
      />

      <AlertDialog open={!!deletingVenue} onOpenChange={() => setDeletingVenue(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare "{deletingVenue?.name}"? 
              Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVenue}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
