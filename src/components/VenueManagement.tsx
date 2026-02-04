import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { type Venue, type VenueReview } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  Users,
  CalendarBlank
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { AddVenueDialog } from '@/components/AddVenueDialog'
import { EditVenueDialog } from '@/components/EditVenueDialog'
import { VenueStatsDialog } from '@/components/VenueStatsDialog'
import { VenueAvailabilityCalendar } from '@/components/VenueAvailabilityCalendar'
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

interface VenueManagementProps {
  onBack: () => void
}

export function VenueManagement({ onBack }: VenueManagementProps) {
  const [venues, setVenues] = useKV<Venue[]>('venues', [])
  const [reviews] = useKV<VenueReview[]>('venue-reviews', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)
  const [deletingVenue, setDeletingVenue] = useState<Venue | null>(null)
  const [statsVenue, setStatsVenue] = useState<Venue | null>(null)
  const [calendarVenue, setCalendarVenue] = useState<Venue | null>(null)

  const filteredVenues = venues?.filter(venue => {
    const query = searchQuery.toLowerCase()
    return (
      venue.name.toLowerCase().includes(query) ||
      venue.city.toLowerCase().includes(query) ||
      venue.address.toLowerCase().includes(query)
    )
  }) || []

  const handleAddVenue = (venue: Venue) => {
    setVenues(currentVenues => [...(currentVenues || []), venue])
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
    venues?.forEach(venue => {
      cityMap.set(venue.city, (cityMap.get(venue.city) || 0) + 1)
    })
    return Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
  }

  const getAverageRating = () => {
    const venuesWithRatings = venues?.filter(v => v.rating) || []
    if (venuesWithRatings.length === 0) return 0
    const sum = venuesWithRatings.reduce((acc, v) => acc + (v.rating || 0), 0)
    return sum / venuesWithRatings.length
  }

  const getTotalReviews = () => {
    return venues?.reduce((acc, v) => acc + (v.totalReviews || 0), 0) || 0
  }

  if (calendarVenue) {
    return <VenueAvailabilityCalendar venue={calendarVenue} onClose={() => setCalendarVenue(null)} />
  }

  const cityStats = getCityStats()
  const avgRating = getAverageRating()
  const totalReviews = getTotalReviews()

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
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
              <div>
                <h1 className="text-2xl font-bold">Gestione Venues</h1>
                <p className="text-sm text-muted-foreground">
                  {venues?.length || 0} venue totali
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            >
              <Plus size={20} weight="bold" />
              Aggiungi Venue
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Buildings size={24} weight="duotone" className="text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{venues?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Venues Totali</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-secondary/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <Star size={24} weight="duotone" className="text-secondary" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {avgRating > 0 ? avgRating.toFixed(1) : '-'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Rating Medio ({totalReviews} recensioni)
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-accent/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <MapPin size={24} weight="duotone" className="text-accent" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{cityStats.length}</div>
                <div className="text-sm text-muted-foreground">Città Coperte</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {cityStats.length > 0 && (
          <Card className="mb-8">
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
                        animate={{ width: `${(count / (venues?.length || 1)) * 100}%` }}
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
              <CardTitle className="text-lg">Tutti i Venues</CardTitle>
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
            </div>
          </CardHeader>
          <CardContent>
            {filteredVenues.length === 0 ? (
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
              <div className="space-y-4">
                {filteredVenues.map((venue, index) => {
                  const venueReviews = getVenueReviews(venue.id)
                  return (
                    <motion.div
                      key={venue.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="hover:border-primary/30 transition-colors">
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
                            <div className="flex gap-2 shrink-0">
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
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setDeletingVenue(venue)}
                                className="hover:bg-destructive/10 hover:border-destructive/30 text-destructive"
                              >
                                <Trash size={18} weight="duotone" />
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
          </CardContent>
        </Card>
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
