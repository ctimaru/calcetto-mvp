import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { type Match, type SkillLevel, type User, type Transaction, type Participant } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { MatchCard } from '@/components/MatchCard'
import { MatchDetailsDialog } from '@/components/MatchDetailsDialog'
import { PaymentDialog } from '@/components/PaymentDialog'
import { 
  MagnifyingGlass, 
  FunnelSimple, 
  Calendar,
  MapPin,
  X,
  SoccerBall,
  ArrowLeft
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { formatDate, generateId } from '@/lib/helpers'

interface BrowseMatchesProps {
  onBack: () => void
  currentUser: User | null
}

export function BrowseMatches({ onBack, currentUser }: BrowseMatchesProps) {
  const [matches, setMatches] = useKV<Match[]>('matches', generateMockMatches())
  const [transactions, setTransactions] = useKV<Transaction[]>('transactions', [])
  const [users, setUsers] = useKV<User[]>('users', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<SkillLevel | 'all'>('all')
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('all')
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [matchToJoin, setMatchToJoin] = useState<Match | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const cities = useMemo(() => {
    if (!matches) return []
    const citySet = new Set(matches.map(m => m.venue.city))
    return Array.from(citySet).sort()
  }, [matches])

  const dates = useMemo(() => {
    if (!matches) return []
    const dateSet = new Set(matches.map(m => m.date))
    return Array.from(dateSet).sort()
  }, [matches])

  const filteredMatches = useMemo(() => {
    if (!matches) return []
    return matches.filter(match => {
      const matchesSearch = searchQuery === '' || 
        match.venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.venue.city.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesSkillLevel = selectedSkillLevel === 'all' || match.skillLevel === selectedSkillLevel
      const matchesCity = selectedCity === 'all' || match.venue.city === selectedCity
      const matchesDate = selectedDate === 'all' || match.date === selectedDate
      
      return matchesSearch && matchesSkillLevel && matchesCity && matchesDate && match.status === 'open'
    })
  }, [matches, searchQuery, selectedSkillLevel, selectedCity, selectedDate])

  const activeFilterCount = [
    selectedSkillLevel !== 'all',
    selectedCity !== 'all',
    selectedDate !== 'all'
  ].filter(Boolean).length

  const clearFilters = () => {
    setSelectedSkillLevel('all')
    setSelectedCity('all')
    setSelectedDate('all')
    setSearchQuery('')
  }

  const handleJoinMatch = (matchId: string) => {
    if (!currentUser) {
      toast.error('Devi creare un profilo per unirti a una partita')
      return
    }

    const match = matches?.find(m => m.id === matchId)
    if (!match) {
      toast.error('Partita non trovata')
      return
    }

    setMatchToJoin(match)
    setSelectedMatch(null)
  }

  const handlePaymentConfirm = (paymentMethod: 'card' | 'paypal' | 'bank_transfer', cardLast4?: string) => {
    if (!matchToJoin || !currentUser) return

    const newParticipant: Participant = {
      userId: currentUser.id,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      skillLevel: currentUser.skillLevel,
      joinedAt: new Date().toISOString(),
      paid: true
    }

    const updatedMatches = (matches || []).map(m => {
      if (m.id === matchToJoin.id) {
        return {
          ...m,
          currentPlayers: m.currentPlayers + 1,
          participants: [...m.participants, newParticipant],
          status: (m.currentPlayers + 1 >= m.totalPlayers ? 'full' : 'open') as 'open' | 'full' | 'cancelled'
        }
      }
      return m
    })

    const updatedUser: User = {
      ...currentUser,
      joinedMatches: [...currentUser.joinedMatches, matchToJoin.id]
    }

    const updatedUsers = (users || []).map(u => 
      u.id === currentUser.id ? updatedUser : u
    )

    const newTransaction: Transaction = {
      id: generateId(),
      userId: currentUser.id,
      matchId: matchToJoin.id,
      type: 'payment',
      status: 'completed',
      amount: matchToJoin.price,
      description: `Pagamento per partita presso ${matchToJoin.venue.name}`,
      timestamp: new Date().toISOString(),
      paymentMethod,
      cardLast4,
      metadata: {
        venueName: matchToJoin.venue.name,
        matchDate: formatDate(matchToJoin.date),
        matchTime: matchToJoin.time
      }
    }

    setMatches(updatedMatches)
    setUsers(updatedUsers)
    setTransactions((currentTransactions) => [...(currentTransactions || []), newTransaction])
    
    setMatchToJoin(null)
    toast.success(`Ti sei unito alla partita presso ${matchToJoin.venue.name}!`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="hover:bg-primary/10"
            >
              <ArrowLeft size={24} weight="bold" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Sfoglia Partite</h1>
              <p className="text-muted-foreground">Trova la partita perfetta per te</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <MagnifyingGlass 
                  size={20} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                />
                <Input
                  placeholder="Cerca per nome campo o città..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <Button
                variant={activeFilterCount > 0 ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <FunnelSimple size={20} weight={showFilters ? "fill" : "regular"} />
                <span className="ml-2 hidden sm:inline">Filtri</span>
                {activeFilterCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Card className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="skill-level" className="text-sm font-medium flex items-center gap-2">
                          <SoccerBall size={16} weight="fill" className="text-primary" />
                          Livello
                        </Label>
                        <Select 
                          value={selectedSkillLevel} 
                          onValueChange={(value) => setSelectedSkillLevel(value as SkillLevel | 'all')}
                        >
                          <SelectTrigger id="skill-level">
                            <SelectValue placeholder="Tutti i livelli" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tutti i livelli</SelectItem>
                            <SelectItem value="principiante">Principiante</SelectItem>
                            <SelectItem value="intermedio">Intermedio</SelectItem>
                            <SelectItem value="avanzato">Avanzato</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium flex items-center gap-2">
                          <MapPin size={16} weight="fill" className="text-primary" />
                          Città
                        </Label>
                        <Select 
                          value={selectedCity} 
                          onValueChange={setSelectedCity}
                        >
                          <SelectTrigger id="city">
                            <SelectValue placeholder="Tutte le città" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tutte le città</SelectItem>
                            {cities.map(city => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                          <Calendar size={16} weight="fill" className="text-primary" />
                          Data
                        </Label>
                        <Select 
                          value={selectedDate} 
                          onValueChange={setSelectedDate}
                        >
                          <SelectTrigger id="date">
                            <SelectValue placeholder="Tutte le date" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tutte le date</SelectItem>
                            {dates.map(date => (
                              <SelectItem key={date} value={date}>
                                {new Date(date).toLocaleDateString('it-IT', { 
                                  weekday: 'short', 
                                  day: 'numeric', 
                                  month: 'long' 
                                })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {activeFilterCount > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={clearFilters}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X size={16} className="mr-2" />
                          Cancella tutti i filtri
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {filteredMatches.length === 0 
                ? 'Nessuna partita trovata' 
                : `${filteredMatches.length} ${filteredMatches.length === 1 ? 'partita trovata' : 'partite trovate'}`
              }
            </p>
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Card className="max-w-md mx-auto p-8">
              <SoccerBall size={64} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nessuna partita disponibile</h3>
              <p className="text-muted-foreground mb-6">
                Prova a modificare i tuoi filtri o cerca in un'altra città
              </p>
              {activeFilterCount > 0 && (
                <Button onClick={clearFilters} variant="outline">
                  Cancella filtri
                </Button>
              )}
            </Card>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            layout
          >
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                layout
              >
                <MatchCard 
                  match={match} 
                  onViewDetails={setSelectedMatch}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <MatchDetailsDialog
        match={selectedMatch}
        open={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onJoin={handleJoinMatch}
        currentUser={currentUser}
      />

      <PaymentDialog
        match={matchToJoin}
        open={!!matchToJoin}
        onClose={() => setMatchToJoin(null)}
        onConfirm={handlePaymentConfirm}
        currentUser={currentUser}
      />
    </div>
  )
}

function generateMockMatches(): Match[] {
  const cities = ['Milano', 'Roma', 'Torino', 'Napoli', 'Firenze', 'Bologna']
  const skillLevels: SkillLevel[] = ['principiante', 'intermedio', 'avanzato']
  const venues = [
    'Campo Sempione', 'Arena Colosseo', 'Stadio delle Alpi', 
    'Campo San Paolo', 'Piazzale Michelangelo', 'Campo Maggiore',
    'Centro Sportivo Milano', 'Calcetto Roma Nord', 'Torino Sports',
    'Napoli Calcio Center', 'Firenze Football', 'Bologna Arena'
  ]

  const matches: Match[] = []
  const today = new Date()

  for (let i = 0; i < 24; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + Math.floor(i / 3))
    
    const city = cities[i % cities.length]
    const venueName = venues[i % venues.length]
    
    matches.push({
      id: `match-${i + 1}`,
      date: date.toISOString().split('T')[0],
      time: ['18:00', '19:00', '20:00', '21:00'][i % 4],
      venue: {
        id: `venue-${i + 1}`,
        name: venueName,
        address: `Via Example ${i + 1}`,
        city: city,
        phone: '+39 02 1234567',
        rating: 3.5 + Math.random() * 1.5,
        totalReviews: Math.floor(Math.random() * 50) + 5
      },
      totalPlayers: 10,
      currentPlayers: Math.floor(Math.random() * 9) + 1,
      skillLevel: skillLevels[i % 3],
      price: 10 + Math.floor(Math.random() * 10),
      status: 'open',
      participants: [],
      createdBy: 'user-1'
    })
  }

  return matches
}
