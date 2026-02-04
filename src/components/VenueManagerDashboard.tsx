import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { type Venue, type VenueManager, type VenueBooking, type Match, type VenueReview } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ArrowLeft,
  Buildings,
  CalendarBlank,
  Users,
  CurrencyDollar,
  Star,
  SignOut,
  Plus,
  ChartBar,
  Bell,
  MapPin,
  Phone
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { AddVenueDialog } from '@/components/AddVenueDialog'
import { EditVenueDialog } from '@/components/EditVenueDialog'
import { VenueAvailabilityCalendar } from '@/components/VenueAvailabilityCalendar'

interface VenueManagerDashboardProps {
  manager: VenueManager
  onLogout: () => void
}

export function VenueManagerDashboard({ manager, onLogout }: VenueManagerDashboardProps) {
  const [venues, setVenues] = useKV<Venue[]>('venues', [])
  const [matches] = useKV<Match[]>('matches', [])
  const [bookings] = useKV<VenueBooking[]>('venue-bookings', [])
  const [reviews] = useKV<VenueReview[]>('venue-reviews', [])
  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)
  const [calendarVenue, setCalendarVenue] = useState<Venue | null>(null)

  const managerVenues = venues?.filter(v => v.managerId === manager.id) || []

  const todayBookings = bookings?.filter(b => {
    const isManagerVenue = managerVenues.some(v => v.id === b.venueId)
    const isToday = b.date === new Date().toISOString().split('T')[0]
    return isManagerVenue && isToday
  }) || []

  const upcomingBookings = bookings?.filter(b => {
    const isManagerVenue = managerVenues.some(v => v.id === b.venueId)
    const isUpcoming = new Date(b.date) > new Date()
    return isManagerVenue && isUpcoming && b.status === 'booked'
  }) || []

  const totalRevenue = matches?.filter(m => 
    managerVenues.some(v => v.id === m.venue.id)
  ).reduce((sum, m) => sum + (m.price * m.currentPlayers), 0) || 0

  const managerReviews = reviews?.filter(r => 
    managerVenues.some(v => v.id === r.venueId)
  ) || []

  const averageRating = managerReviews.length > 0
    ? managerReviews.reduce((sum, r) => sum + r.rating, 0) / managerReviews.length
    : 0

  const handleAddVenue = async (venue: Venue) => {
    const venueWithManager = {
      ...venue,
      managerId: manager.id,
      managerName: `${manager.firstName} ${manager.lastName}`
    }

    setVenues(currentVenues => [...(currentVenues || []), venueWithManager])
    
    const managers = await window.spark.kv.get<VenueManager[]>('venue-managers') || []
    const updatedManagers = managers.map(m => 
      m.id === manager.id 
        ? { ...m, venueIds: [...m.venueIds, venue.id] }
        : m
    )
    await window.spark.kv.set('venue-managers', updatedManagers)

    setIsAddVenueOpen(false)
    toast.success(`Venue "${venue.name}" aggiunto con successo`)
  }

  const handleEditVenue = (updatedVenue: Venue) => {
    setVenues(currentVenues =>
      (currentVenues || []).map(v => v.id === updatedVenue.id ? updatedVenue : v)
    )
    setEditingVenue(null)
    toast.success(`Venue "${updatedVenue.name}" aggiornato con successo`)
  }

  const handleViewCalendar = (venue: Venue) => {
    setCalendarVenue(venue)
  }

  const handleLogout = () => {
    toast.success('Logout effettuato con successo')
    onLogout()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Buildings size={32} weight="duotone" className="text-primary" />
              <div>
                <h1 className="text-lg font-bold">Dashboard Manager</h1>
                <p className="text-sm text-muted-foreground">
                  {manager.firstName} {manager.lastName}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <SignOut size={20} />
              Esci
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Buildings size={24} weight="duotone" className="text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{managerVenues.length}</div>
                <div className="text-sm text-muted-foreground">Venue Gestiti</div>
              </CardContent>
            </Card>

            <Card>
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

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <Star size={24} weight="duotone" className="text-secondary" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{averageRating.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Rating Medio</div>
              </CardContent>
            </Card>

            <Card>
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
          </div>

          <Tabs defaultValue="venues" className="space-y-6">
            <TabsList>
              <TabsTrigger value="venues">I Miei Venue</TabsTrigger>
              <TabsTrigger value="bookings">Prenotazioni</TabsTrigger>
              <TabsTrigger value="reviews">Recensioni</TabsTrigger>
            </TabsList>

            <TabsContent value="venues" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">I Miei Venue</h2>
                <Button
                  onClick={() => setIsAddVenueOpen(true)}
                  className="gap-2"
                >
                  <Plus size={20} weight="bold" />
                  Aggiungi Venue
                </Button>
              </div>

              {managerVenues.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Buildings size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Nessun venue ancora</h3>
                    <p className="text-muted-foreground mb-4">
                      Inizia aggiungendo il tuo primo venue
                    </p>
                    <Button onClick={() => setIsAddVenueOpen(true)}>
                      <Plus size={20} weight="bold" className="mr-2" />
                      Aggiungi Venue
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {managerVenues.map((venue) => {
                    const venueReviews = reviews?.filter(r => r.venueId === venue.id) || []
                    const venueBookings = bookings?.filter(b => b.venueId === venue.id && b.status === 'booked') || []

                    return (
                      <motion.div
                        key={venue.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="hover:shadow-lg transition-all">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  {venue.name}
                                  {venue.rating && (
                                    <Badge variant="secondary" className="gap-1">
                                      <Star size={14} weight="fill" />
                                      {venue.rating.toFixed(1)}
                                    </Badge>
                                  )}
                                </CardTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                  <MapPin size={16} />
                                  {venue.city}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm">
                                <Phone size={16} className="text-muted-foreground" />
                                {venue.phone}
                              </div>
                              
                              <div className="flex gap-2 text-sm">
                                <Badge variant="outline">{venueBookings.length} prenotazioni</Badge>
                                <Badge variant="outline">{venueReviews.length} recensioni</Badge>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewCalendar(venue)}
                                  className="flex-1"
                                >
                                  <CalendarBlank size={16} className="mr-2" />
                                  Calendario
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingVenue(venue)}
                                  className="flex-1"
                                >
                                  <ChartBar size={16} className="mr-2" />
                                  Modifica
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </TabsContent>

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
                    {managerReviews.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        Nessuna recensione ancora
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {managerReviews.map((review) => {
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
          </Tabs>
        </motion.div>
      </div>

      <AddVenueDialog
        open={isAddVenueOpen}
        onClose={() => setIsAddVenueOpen(false)}
        onVenueAdded={handleAddVenue}
      />

      {editingVenue && (
        <EditVenueDialog
          open={true}
          venue={editingVenue}
          onClose={() => setEditingVenue(null)}
          onVenueUpdated={handleEditVenue}
        />
      )}

      {calendarVenue && (
        <VenueAvailabilityCalendar
          venue={calendarVenue}
          onClose={() => setCalendarVenue(null)}
        />
      )}
    </div>
  )
}
