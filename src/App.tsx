import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { type User, type Match } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Users, 
  Trophy, 
  Calendar, 
  TrendUp, 
  MapPin,
  ArrowRight,
  Star,
  CheckCircle,
  User as UserIcon,
  Plus,
  Broadcast,
  Buildings
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { Toaster } from 'sonner'
import { toast } from 'sonner'
import { BrowseMatches } from '@/components/BrowseMatches'
import { ProfileCreationDialog } from '@/components/ProfileCreationDialog'
import { ProfileView } from '@/components/ProfileView'
import { CreateMatchDialog } from '@/components/CreateMatchDialog'
import { ActivePlayersDialog } from '@/components/ActivePlayersDialog'
import { LiveMatchesView } from '@/components/LiveMatchesView'
import { VenueManagement } from '@/components/VenueManagement'
import { getDefaultVenues } from '@/lib/helpers'

interface Stat {
  label: string
  value: string
  icon: React.ReactNode
  trend?: string
}

interface Feature {
  title: string
  description: string
  icon: React.ReactNode
}

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'browse' | 'profile' | 'live' | 'venues'>('home')
  const [currentUser, setCurrentUser] = useKV<User | null>('current-user', null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isCreateMatchDialogOpen, setIsCreateMatchDialogOpen] = useState(false)
  const [isActivePlayersDialogOpen, setIsActivePlayersDialogOpen] = useState(false)
  const [matches] = useKV<Match[]>('matches', [])
  const [activeMatches] = useKV<number>('active-matches', 47)
  const [totalPlayers] = useKV<number>('total-players', 1243)
  const [upcomingGames] = useKV<number>('upcoming-games', 23)
  const [isAdmin, setIsAdmin] = useState(false)
  
  const liveMatchesCount = matches?.filter(match => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    if (match.date !== todayStr) return false
    
    const [hours, minutes] = match.time.split(':').map(Number)
    const matchStart = new Date(match.date)
    matchStart.setHours(hours, minutes, 0, 0)
    const matchEnd = new Date(matchStart.getTime() + 90 * 60000)
    
    return now >= matchStart && now <= matchEnd
  }).length || 0

  useEffect(() => {
    const initializeVenues = async () => {
      const existingVenues = await window.spark.kv.get('venues')
      if (!existingVenues || (Array.isArray(existingVenues) && existingVenues.length === 0)) {
        await window.spark.kv.set('venues', getDefaultVenues())
      }
    }
    initializeVenues()
  }, [])

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await window.spark.user()
        setIsAdmin(user?.isOwner || false)
      } catch (error) {
        setIsAdmin(false)
      }
    }
    checkAdmin()
  }, [])

  useEffect(() => {
    if (!currentUser) {
      setIsProfileDialogOpen(true)
    }
  }, [])

  const handleProfileCreated = (user: User) => {
    setCurrentUser(user)
    setIsProfileDialogOpen(false)
  }

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser)
  }

  const handleMatchCreated = (match: Match) => {
    toast.success(`Partita creata! ID: ${match.id}`)
    setIsCreateMatchDialogOpen(false)
    setCurrentView('browse')
  }

  if (currentView === 'browse') {
    return (
      <>
        <Toaster richColors position="top-center" />
        <BrowseMatches onBack={() => setCurrentView('home')} currentUser={currentUser || null} />
      </>
    )
  }

  if (currentView === 'live') {
    return (
      <>
        <Toaster richColors position="top-center" />
        <LiveMatchesView onBack={() => setCurrentView('home')} currentUser={currentUser || null} />
      </>
    )
  }

  if (currentView === 'venues') {
    return (
      <>
        <Toaster richColors position="top-center" />
        <VenueManagement onBack={() => setCurrentView('home')} />
      </>
    )
  }

  if (currentView === 'profile' && currentUser) {
    return (
      <>
        <Toaster richColors position="top-center" />
        <ProfileView 
          user={currentUser} 
          onBack={() => setCurrentView('home')}
          onUserUpdate={handleUserUpdate}
        />
      </>
    )
  }

  const stats: Stat[] = [
    {
      label: 'Active Players',
      value: (totalPlayers || 0).toLocaleString(),
      icon: <Users size={24} weight="duotone" />,
      trend: '+12% this week'
    },
    {
      label: 'Live Matches',
      value: liveMatchesCount.toString(),
      icon: <Broadcast size={24} weight="duotone" />,
    },
    {
      label: 'Upcoming Games',
      value: (upcomingGames || 0).toString(),
      icon: <Calendar size={24} weight="duotone" />,
      trend: 'Next 7 days'
    }
  ]

  const features: Feature[] = [
    {
      title: 'Find Your Match',
      description: 'Browse matches by skill level, location, and time. Join games that fit your schedule.',
      icon: <MapPin size={32} weight="duotone" className="text-primary" />
    },
    {
      title: 'Track Progress',
      description: 'Monitor your stats, achievements, and improvement over time with detailed analytics.',
      icon: <TrendUp size={32} weight="duotone" className="text-secondary" />
    },
    {
      title: 'Rate Venues',
      description: 'Share your experience and help others find the best fields in your area.',
      icon: <Star size={32} weight="duotone" className="text-accent" />
    },
    {
      title: 'Secure Payments',
      description: 'Safe and easy payment processing. Get automatic refunds if matches are cancelled.',
      icon: <CheckCircle size={32} weight="duotone" className="text-primary" />
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy size={32} weight="fill" className="text-primary" />
              <span className="text-xl font-bold">Players League</span>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentView('venues')}
                  className="gap-2 hover:bg-primary/10 border-primary/30"
                >
                  <Buildings size={20} weight="duotone" />
                  <span className="hidden md:inline">Venues</span>
                </Button>
              )}
              {currentUser && (
                <>
                  <Button
                    onClick={() => setIsCreateMatchDialogOpen(true)}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                  >
                    <Plus size={20} weight="bold" />
                    <span className="hidden sm:inline">Crea Partita</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentView('profile')}
                    className="gap-2 hover:bg-primary/10"
                  >
                    <Avatar className="h-8 w-8 border-2 border-accent/30">
                      <AvatarFallback className="bg-accent/10 text-accent text-sm font-bold">
                        {`${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{currentUser.firstName}</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              oklch(0.45 0.12 155 / 0.03) 10px,
              oklch(0.45 0.12 155 / 0.03) 20px
            )`
          }}
        />
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge 
              variant="outline" 
              className="mb-6 text-sm px-4 py-1.5 border-primary/20 bg-primary/5"
            >
              <Trophy size={16} weight="fill" className="mr-2 text-primary" />
              Join the League Today
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Players{' '}
              <span className="text-primary">League</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Connect with players, organize matches, and take your game to the next level.
              <br className="hidden md:block" />
              Your ultimate platform for amateur soccer.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                onClick={() => setCurrentView('browse')}
              >
                Sfoglia Partite
                <ArrowRight size={20} weight="bold" className="ml-2" />
              </Button>
              {currentUser ? (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8 py-6 text-lg border-2 hover:bg-primary/5"
                  onClick={() => setCurrentView('profile')}
                >
                  Vai al Profilo
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8 py-6 text-lg border-2 hover:bg-primary/5"
                  onClick={() => setIsProfileDialogOpen(true)}
                >
                  Crea Profilo
                </Button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              >
                <Card 
                  className={`border-border/50 hover:border-primary/30 transition-all hover:shadow-lg ${
                    stat.label === 'Active Players' || stat.label === 'Live Matches' ? 'cursor-pointer hover:scale-105' : ''
                  }`}
                  onClick={() => {
                    if (stat.label === 'Active Players') {
                      setIsActivePlayersDialogOpen(true)
                    } else if (stat.label === 'Live Matches' && liveMatchesCount > 0) {
                      setCurrentView('live')
                    }
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-lg bg-primary/10 text-primary ${
                        stat.label === 'Live Matches' && liveMatchesCount > 0 ? 'animate-pulse' : ''
                      }`}>
                        {stat.icon}
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
                    {stat.trend && (
                      <div className="text-xs text-accent font-medium">
                        {stat.trend}
                      </div>
                    )}
                    {stat.label === 'Live Matches' && liveMatchesCount > 0 && (
                      <div className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                        <Broadcast size={12} weight="fill" />
                        Clicca per visualizzare
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ 
              duration: 0.7, 
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-6xl mx-auto"
          >
            <motion.div
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Card className="border-primary/20 shadow-xl overflow-hidden relative group">
                <div className="grid md:grid-cols-2 gap-0">
                  <motion.div 
                    className="relative order-2 md:order-1 h-64 md:h-auto overflow-hidden"
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.img 
                      src="https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80"
                      alt="Kid playing soccer"
                      className="absolute inset-0 w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"
                      initial={{ opacity: 0.5 }}
                      whileHover={{ opacity: 0.3 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                  <div className="relative order-1 md:order-2 overflow-hidden">
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80"
                      initial={{ opacity: 0.9 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle at 50% 50%, white 0%, transparent 70%)'
                      }}
                    />
                    <CardContent className="relative pt-12 pb-12 px-8 text-primary-foreground h-full flex flex-col justify-center">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 0.6, 
                          delay: 0.4,
                          type: "spring",
                          stiffness: 200,
                          damping: 15
                        }}
                      >
                        <Trophy size={48} weight="duotone" className="mb-6 opacity-90" />
                      </motion.div>
                      <motion.h2 
                        className="text-3xl md:text-4xl font-bold mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        Ready to Play?
                      </motion.h2>
                      <motion.p 
                        className="text-lg mb-8 opacity-95"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 0.95, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        Join thousands of players already on the platform. Create your profile and find your next match in minutes.
                      </motion.p>
                      <motion.div 
                        className="flex flex-col sm:flex-row gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            size="lg"
                            className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                            onClick={() => setCurrentView('browse')}
                          >
                            Inizia Ora
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ 
                                duration: 1.5, 
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <ArrowRight size={20} weight="bold" className="ml-2" />
                            </motion.div>
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            size="lg"
                            variant="outline"
                            className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 px-8 py-6 text-lg"
                          >
                            Scopri di Più
                          </Button>
                        </motion.div>
                      </motion.div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join a community of passionate players. Find matches, track your progress, and improve your game.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-border/50 hover:border-primary/30 transition-all hover:shadow-lg group">
                  <CardContent className="pt-6">
                    <div className="mb-4 transition-transform group-hover:scale-110 inline-block">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Trophy size={32} weight="fill" className="text-primary" />
              <span className="text-xl font-bold">Players League</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Players League. Connecting players worldwide.
            </div>
          </div>
        </div>
      </footer>

      <ProfileCreationDialog
        open={isProfileDialogOpen && !currentUser}
        onClose={() => {
          if (currentUser) {
            setIsProfileDialogOpen(false)
          }
        }}
        onProfileCreated={handleProfileCreated}
      />

      <CreateMatchDialog
        open={isCreateMatchDialogOpen}
        onClose={() => setIsCreateMatchDialogOpen(false)}
        onMatchCreated={handleMatchCreated}
        currentUser={currentUser || null}
      />

      <ActivePlayersDialog
        open={isActivePlayersDialogOpen}
        onClose={() => setIsActivePlayersDialogOpen(false)}
      />
    </div>
  )
}

export default App
