import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { type User, type Match } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User as UserIcon, 
  MapPin, 
  EnvelopeSimple,
  Calendar,
  Trophy,
  ArrowLeft,
  PencilSimple,
  SoccerBall,
  Star,
  TrendUp,
  CheckCircle
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { ProfileCreationDialog } from '@/components/ProfileCreationDialog'
import { SkillBadge } from '@/components/SkillBadge'

interface ProfileViewProps {
  user: User
  onBack: () => void
  onUserUpdate: (user: User) => void
}

export function ProfileView({ user, onBack, onUserUpdate }: ProfileViewProps) {
  const [matches] = useKV<Match[]>('matches', [])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const userMatches = matches?.filter(match => 
    match.participants.some(p => p.userId === user.id)
  ) || []

  const upcomingMatches = userMatches.filter(match => {
    const matchDate = new Date(match.date)
    return matchDate >= new Date() && match.status !== 'cancelled'
  })

  const pastMatches = userMatches.filter(match => {
    const matchDate = new Date(match.date)
    return matchDate < new Date() || match.status === 'cancelled'
  })

  const stats = [
    {
      label: 'Partite Giocate',
      value: pastMatches.length.toString(),
      icon: <SoccerBall size={24} weight="duotone" />,
      color: 'text-primary'
    },
    {
      label: 'Partite Prenotate',
      value: upcomingMatches.length.toString(),
      icon: <Calendar size={24} weight="duotone" />,
      color: 'text-secondary'
    },
    {
      label: 'Livello',
      value: user.skillLevel.charAt(0).toUpperCase() + user.skillLevel.slice(1),
      icon: <Trophy size={24} weight="duotone" />,
      color: 'text-accent'
    }
  ]

  const getInitials = () => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
  }

  const handleUpdateProfile = (updatedUser: User) => {
    onUserUpdate(updatedUser)
    setIsEditDialogOpen(false)
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="hover:bg-primary/10"
              >
                <ArrowLeft size={24} weight="bold" />
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight">Profilo</h1>
                <p className="text-muted-foreground">Le tue informazioni e statistiche</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(true)}
                className="gap-2"
              >
                <PencilSimple size={18} weight="bold" />
                Modifica
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <Avatar className="h-24 w-24 border-4 border-accent/20">
                    <AvatarFallback className="bg-accent/10 text-accent text-2xl font-bold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-3xl font-bold mb-2">
                          {user.firstName} {user.lastName}
                        </h2>
                        <div className="flex flex-wrap gap-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <EnvelopeSimple size={16} />
                            <span className="text-sm">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin size={16} />
                            <span className="text-sm">{user.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={16} />
                            <span className="text-sm">{user.age} anni</span>
                          </div>
                        </div>
                      </div>
                      <SkillBadge level={user.skillLevel} size="lg" />
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {stats.map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className={`${stat.color}`}>
                            {stat.icon}
                          </div>
                          <div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="upcoming" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="upcoming" className="gap-2">
                  <Calendar size={18} />
                  Prossime ({upcomingMatches.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-2">
                  <CheckCircle size={18} />
                  Completate ({pastMatches.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingMatches.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                      <SoccerBall size={64} className="mx-auto mb-4 text-muted-foreground/50" weight="duotone" />
                      <h3 className="text-lg font-semibold mb-2">Nessuna partita prenotata</h3>
                      <p className="text-muted-foreground mb-4">
                        Inizia a giocare! Sfoglia le partite disponibili e prenota il tuo posto.
                      </p>
                      <Button
                        onClick={onBack}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        Sfoglia Partite
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {upcomingMatches.map((match, index) => (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card className="hover:border-primary/30 transition-all">
                          <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="text-lg font-semibold mb-1">{match.venue.name}</h3>
                                    <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                                      <MapPin size={14} />
                                      <span className="text-sm">{match.venue.city}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-3 text-sm">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar size={16} className="text-muted-foreground" />
                                    <span>{new Date(match.date).toLocaleDateString('it-IT', { 
                                      weekday: 'short', 
                                      day: 'numeric', 
                                      month: 'short' 
                                    })}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-medium">{match.time}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-muted-foreground">
                                      {match.currentPlayers}/{match.totalPlayers} giocatori
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <SkillBadge level={match.skillLevel} />
                                <Badge variant="outline" className="bg-accent/10 border-accent text-accent-foreground">
                                  €{match.price}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastMatches.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                      <Trophy size={64} className="mx-auto mb-4 text-muted-foreground/50" weight="duotone" />
                      <h3 className="text-lg font-semibold mb-2">Nessuna partita completata</h3>
                      <p className="text-muted-foreground">
                        Le tue partite completate appariranno qui
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {pastMatches.map((match, index) => (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card className="opacity-80 hover:opacity-100 transition-opacity">
                          <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="text-lg font-semibold mb-1">{match.venue.name}</h3>
                                    <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                                      <MapPin size={14} />
                                      <span className="text-sm">{match.venue.city}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-3 text-sm">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar size={16} className="text-muted-foreground" />
                                    <span>{new Date(match.date).toLocaleDateString('it-IT', { 
                                      weekday: 'short', 
                                      day: 'numeric', 
                                      month: 'short' 
                                    })}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-medium">{match.time}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <SkillBadge level={match.skillLevel} />
                                {match.status === 'cancelled' ? (
                                  <Badge variant="outline" className="bg-destructive/10 border-destructive/50 text-destructive">
                                    Annullata
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-primary/10 border-primary/50 text-primary">
                                    <CheckCircle size={14} className="mr-1" weight="fill" />
                                    Completata
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      <ProfileCreationDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onProfileCreated={handleUpdateProfile}
        editingUser={user}
      />
    </>
  )
}
