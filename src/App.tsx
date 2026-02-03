import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { type User, type Match, type SkillLevel, type VenueReview, type Venue } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { UserCircle, SoccerBall } from '@phosphor-icons/react'
import { MatchCard } from '@/components/MatchCard'
import { MatchDetailsDialog } from '@/components/MatchDetailsDialog'
import { ProfileDialog } from '@/components/ProfileDialog'
import { MatchFilters } from '@/components/MatchFilters'
import { AddReviewDialog } from '@/components/AddReviewDialog'
import { VenueReviewsDialog } from '@/components/VenueReviewsDialog'
import { generateId } from '@/lib/helpers'
import { toast, Toaster } from 'sonner'
import { motion } from 'framer-motion'

function App() {
  const [matches, setMatches] = useKV<Match[]>('matches', [])
  const [currentUser, setCurrentUser] = useKV<User | null>('current-user', null)
  const [reviews, setReviews] = useKV<VenueReview[]>('venue-reviews', [])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [showMatchDetails, setShowMatchDetails] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [skillFilter, setSkillFilter] = useState<SkillLevel | 'all'>('all')
  const [showAddReview, setShowAddReview] = useState(false)
  const [matchToReview, setMatchToReview] = useState<Match | null>(null)
  const [showVenueReviews, setShowVenueReviews] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)

  useEffect(() => {
    if (!currentUser) {
      setShowProfile(true)
    }
  }, [currentUser])

  const handleSaveProfile = (userData: Partial<User>) => {
    if (currentUser) {
      setCurrentUser((prev) => (prev ? { ...prev, ...userData } : null))
      toast.success('Profilo aggiornato con successo!')
    } else {
      const newUser: User = {
        id: generateId(),
        email: `user-${Date.now()}@example.com`,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        age: userData.age || 25,
        skillLevel: userData.skillLevel || 'intermedio',
        location: userData.location || '',
        joinedMatches: [],
      }
      setCurrentUser(() => newUser)
      toast.success('Benvenuto su App Calcetto!')
    }
  }

  const handleJoinMatch = (matchId: string) => {
    if (!currentUser) {
      toast.error('Devi completare il profilo per unirti a una partita')
      setShowProfile(true)
      return
    }

    setMatches((currentMatches) => {
      if (!currentMatches) return []
      
      return currentMatches.map((match) => {
        if (match.id === matchId) {
          const newParticipant = {
            userId: currentUser.id,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            skillLevel: currentUser.skillLevel,
            joinedAt: new Date().toISOString(),
            paid: true,
          }

          return {
            ...match,
            currentPlayers: match.currentPlayers + 1,
            participants: [...match.participants, newParticipant],
            status: match.currentPlayers + 1 >= match.totalPlayers ? 'full' : 'open',
          } as Match
        }
        return match
      })
    })

    setCurrentUser((prev) => {
      if (!prev) return null
      return {
        ...prev,
        joinedMatches: [...prev.joinedMatches, matchId],
      }
    })

    toast.success('Ti sei unito alla partita!', {
      description: 'Riceverai una notifica prima della partita.',
    })
  }

  const handleViewDetails = (match: Match) => {
    setSelectedMatch(match)
    setShowMatchDetails(true)
  }

  const handleOpenReviewDialog = (match: Match) => {
    setMatchToReview(match)
    setShowAddReview(true)
  }

  const handleSubmitReview = (reviewData: {
    rating: number
    comment: string
    aspects: {
      cleanliness: number
      quality: number
      facilities: number
      location: number
    }
  }) => {
    if (!currentUser || !matchToReview) return

    const newReview: VenueReview = {
      id: generateId(),
      venueId: matchToReview.venue.id,
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      matchId: matchToReview.id,
      rating: reviewData.rating,
      comment: reviewData.comment,
      aspects: reviewData.aspects,
      timestamp: new Date().toISOString(),
      helpful: 0,
    }

    setReviews((currentReviews) => [...(currentReviews || []), newReview])

    setMatches((currentMatches) => {
      if (!currentMatches) return []
      return currentMatches.map((match) => {
        if (match.venue.id === matchToReview.venue.id) {
          const venueReviews = [...(reviews || []), newReview].filter(
            (r) => r.venueId === match.venue.id
          )
          const avgRating =
            venueReviews.reduce((sum, r) => sum + r.rating, 0) / venueReviews.length

          return {
            ...match,
            venue: {
              ...match.venue,
              rating: avgRating,
              totalReviews: venueReviews.length,
            },
          }
        }
        return match
      })
    })

    toast.success('Recensione pubblicata con successo!', {
      description: 'Grazie per aver condiviso la tua esperienza.',
    })
  }

  const handleViewVenueReviews = (venueId: string) => {
    const match = (matches || []).find((m) => m.venue.id === venueId)
    if (match) {
      setSelectedVenue(match.venue)
      setShowVenueReviews(true)
    }
  }

  const handleMarkReviewHelpful = (reviewId: string) => {
    setReviews((currentReviews) => {
      if (!currentReviews) return []
      return currentReviews.map((review) =>
        review.id === reviewId ? { ...review, helpful: review.helpful + 1 } : review
      )
    })
  }

  const isPastMatch = (match: Match): boolean => {
    const matchDate = new Date(match.date)
    const matchTime = match.time.split(':')
    matchDate.setHours(parseInt(matchTime[0]), parseInt(matchTime[1]))
    return matchDate < new Date()
  }

  const canReviewMatch = (match: Match): boolean => {
    if (!currentUser) return false
    const isParticipant = currentUser.joinedMatches.includes(match.id)
    const isPast = isPastMatch(match)
    const hasReviewed = (reviews || []).some(
      (r) => r.matchId === match.id && r.userId === currentUser.id
    )
    return isParticipant && isPast && !hasReviewed
  }

  const filteredMatches = (matches || []).filter((match) => {
    if (skillFilter === 'all') return true
    return match.skillLevel === skillFilter
  })

  const availableMatches = filteredMatches.filter(
    (match) => !currentUser?.joinedMatches.includes(match.id)
  )

  const myMatches = filteredMatches.filter((match) =>
    currentUser?.joinedMatches.includes(match.id)
  )

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SoccerBall size={32} weight="fill" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">App Calcetto</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowProfile(true)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <UserCircle size={32} weight="fill" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!currentUser ? (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SoccerBall size={64} weight="fill" className="mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">Benvenuto su App Calcetto</h2>
              <p className="text-muted-foreground mb-6">
                Completa il tuo profilo per iniziare a trovare partite
              </p>
              <Button
                onClick={() => setShowProfile(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              >
                Completa il Profilo
              </Button>
            </motion.div>
          </div>
        ) : (
          <Tabs defaultValue="available" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="available">
                Partite Disponibili
                {availableMatches.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-accent text-accent-foreground rounded-full text-xs font-semibold">
                    {availableMatches.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="my-matches">
                Le Mie Partite
                {myMatches.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-semibold">
                    {myMatches.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <MatchFilters skillLevel={skillFilter} onSkillLevelChange={setSkillFilter} />

            <TabsContent value="available" className="space-y-6">
              {availableMatches.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <SoccerBall size={48} weight="thin" className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nessuna partita disponibile</h3>
                  <p className="text-muted-foreground">
                    {skillFilter !== 'all'
                      ? 'Prova a cambiare i filtri o torna più tardi.'
                      : 'Torna più tardi per nuove partite.'}
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableMatches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <MatchCard
                        match={match}
                        onViewDetails={handleViewDetails}
                        isJoined={false}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-matches" className="space-y-6">
              {myMatches.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <SoccerBall size={48} weight="thin" className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Non sei iscritto a nessuna partita</h3>
                  <p className="text-muted-foreground mb-6">
                    Unisciti a una partita per iniziare a giocare!
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myMatches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="relative">
                        <MatchCard match={match} onViewDetails={handleViewDetails} isJoined={true} />
                        {canReviewMatch(match) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReviewDialog(match)}
                            className="w-full mt-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                          >
                            Valuta il Campo
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      <MatchDetailsDialog
        match={selectedMatch}
        open={showMatchDetails}
        onClose={() => setShowMatchDetails(false)}
        onJoin={handleJoinMatch}
        currentUser={currentUser ?? null}
        onViewReviews={handleViewVenueReviews}
        reviews={reviews || []}
      />

      <ProfileDialog
        user={currentUser ?? null}
        open={showProfile}
        onClose={() => {
          if (currentUser) {
            setShowProfile(false)
          }
        }}
        onSave={handleSaveProfile}
      />

      <AddReviewDialog
        match={matchToReview}
        open={showAddReview}
        onClose={() => setShowAddReview(false)}
        onSubmit={handleSubmitReview}
      />

      <VenueReviewsDialog
        venue={selectedVenue}
        reviews={reviews || []}
        open={showVenueReviews}
        onClose={() => setShowVenueReviews(false)}
        onHelpful={handleMarkReviewHelpful}
      />
    </div>
  )
}

export default App
