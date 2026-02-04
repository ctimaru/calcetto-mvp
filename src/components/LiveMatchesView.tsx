import { useState, useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { type Match, type User } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  SoccerBall,
  Users,
  Clock,
  MapPin,
  FireSimple,
  Trophy,
  Broadcast,
  Timer,
  User as UserIcon,
  Star
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDate } from '@/lib/helpers'
import { SkillBadge } from './SkillBadge'

interface LiveMatchesViewProps {
  onBack: () => void
  currentUser: User | null
}

interface LiveMatchData extends Match {
  startTime: string
  elapsedMinutes: number
  events: MatchEvent[]
  score?: {
    teamA: number
    teamB: number
  }
}

interface MatchEvent {
  id: string
  type: 'goal' | 'join' | 'leave' | 'start'
  player?: string
  timestamp: string
  minute?: number
}

export function LiveMatchesView({ onBack, currentUser }: LiveMatchesViewProps) {
  const [matches] = useKV<Match[]>('matches', [])
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid')
  const [selectedMatch, setSelectedMatch] = useState<LiveMatchData | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const liveMatches = useMemo((): LiveMatchData[] => {
    if (!matches) return []
    
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    
    return matches
      .filter(match => {
        if (match.date !== todayStr) return false
        
        const [hours, minutes] = match.time.split(':').map(Number)
        const matchStart = new Date(match.date)
        matchStart.setHours(hours, minutes, 0, 0)
        
        const matchEnd = new Date(matchStart.getTime() + 90 * 60000)
        
        return now >= matchStart && now <= matchEnd
      })
      .map(match => {
        const [hours, minutes] = match.time.split(':').map(Number)
        const matchStart = new Date(match.date)
        matchStart.setHours(hours, minutes, 0, 0)
        
        const elapsedMinutes = Math.floor((now.getTime() - matchStart.getTime()) / 60000)
        
        const events: MatchEvent[] = [
          {
            id: '1',
            type: 'start',
            timestamp: matchStart.toISOString(),
            minute: 0
          }
        ]
        
        if (match.participants && match.participants.length > 0) {
          match.participants.forEach((participant, index) => {
            if (index < 3) {
              events.push({
                id: `join-${index}`,
                type: 'join',
                player: `${participant.firstName} ${participant.lastName}`,
                timestamp: participant.joinedAt,
                minute: Math.max(0, Math.floor(Math.random() * elapsedMinutes))
              })
            }
          })
        }
        
        const goalCount = Math.floor(Math.random() * Math.min(5, Math.floor(elapsedMinutes / 15)))
        for (let i = 0; i < goalCount; i++) {
          events.push({
            id: `goal-${i}`,
            type: 'goal',
            player: match.participants?.[Math.floor(Math.random() * (match.participants.length || 1))]
              ? `${match.participants[Math.floor(Math.random() * match.participants.length)].firstName} ${match.participants[Math.floor(Math.random() * match.participants.length)].lastName}`
              : 'Giocatore',
            timestamp: new Date(matchStart.getTime() + Math.random() * elapsedMinutes * 60000).toISOString(),
            minute: Math.floor(Math.random() * elapsedMinutes)
          })
        }
        
        events.sort((a, b) => (a.minute || 0) - (b.minute || 0))
        
        return {
          ...match,
          startTime: matchStart.toISOString(),
          elapsedMinutes,
          events,
          score: {
            teamA: Math.floor(goalCount / 2),
            teamB: goalCount - Math.floor(goalCount / 2)
          }
        }
      })
      .sort((a, b) => b.elapsedMinutes - a.elapsedMinutes)
  }, [matches, currentTime])

  const getMatchStatus = (elapsedMinutes: number) => {
    if (elapsedMinutes < 45) return 'Primo Tempo'
    if (elapsedMinutes < 55) return 'Intervallo'
    if (elapsedMinutes < 90) return 'Secondo Tempo'
    return 'Fine Partita'
  }

  const getStatusColor = (elapsedMinutes: number) => {
    if (elapsedMinutes < 45) return 'text-accent'
    if (elapsedMinutes < 55) return 'text-secondary'
    if (elapsedMinutes < 90) return 'text-accent'
    return 'text-muted-foreground'
  }

  if (selectedMatch) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMatch(null)}
              >
                <ArrowLeft size={20} weight="bold" />
              </Button>
              <div className="flex items-center gap-2">
                <Broadcast size={24} weight="fill" className="text-red-500 animate-pulse" />
                <span className="text-lg font-bold">Match Live</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive" className="animate-pulse">
                        <Broadcast size={14} weight="fill" className="mr-1" />
                        LIVE
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(selectedMatch.elapsedMinutes)}>
                        {getMatchStatus(selectedMatch.elapsedMinutes)}
                      </Badge>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">{selectedMatch.venue.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <MapPin size={16} weight="fill" />
                      <span>{selectedMatch.venue.address}, {selectedMatch.venue.city}</span>
                    </div>
                  </div>
                  <SkillBadge level={selectedMatch.skillLevel} />
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-lg p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center flex-1">
                      <div className="text-6xl font-bold text-primary mb-2">
                        {selectedMatch.score?.teamA || 0}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">TEAM A</div>
                    </div>
                    
                    <div className="px-6">
                      <SoccerBall size={32} weight="fill" className="text-primary/40" />
                    </div>
                    
                    <div className="text-center flex-1">
                      <div className="text-6xl font-bold text-secondary mb-2">
                        {selectedMatch.score?.teamB || 0}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">TEAM B</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                    <Timer size={20} weight="fill" className="text-accent" />
                    <span>{selectedMatch.elapsedMinutes}'</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Match Progress
                  </h3>
                  <Progress value={(selectedMatch.elapsedMinutes / 90) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0'</span>
                    <span>45'</span>
                    <span>90'</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Players
                  </h3>
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Users size={20} weight="fill" className="text-primary" />
                      <span className="font-semibold">{selectedMatch.currentPlayers} / {selectedMatch.totalPlayers}</span>
                    </div>
                    <Progress 
                      value={(selectedMatch.currentPlayers / selectedMatch.totalPlayers) * 100} 
                      className="w-32 h-2"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Live Events
                  </h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                      {selectedMatch.events.slice().reverse().map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                            {event.minute}'
                          </div>
                          <div className="flex-1 min-w-0">
                            {event.type === 'goal' && (
                              <div className="flex items-center gap-2">
                                <SoccerBall size={18} weight="fill" className="text-accent shrink-0" />
                                <span className="font-semibold text-sm">Goal!</span>
                                <span className="text-sm text-muted-foreground truncate">{event.player}</span>
                              </div>
                            )}
                            {event.type === 'join' && (
                              <div className="flex items-center gap-2">
                                <UserIcon size={18} weight="fill" className="text-primary shrink-0" />
                                <span className="text-sm text-muted-foreground truncate">{event.player} si è unito</span>
                              </div>
                            )}
                            {event.type === 'start' && (
                              <div className="flex items-center gap-2">
                                <Trophy size={18} weight="fill" className="text-accent shrink-0" />
                                <span className="font-semibold text-sm">Partita iniziata</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {selectedMatch.participants && selectedMatch.participants.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Active Players ({selectedMatch.participants.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedMatch.participants.map((participant) => (
                        <motion.div
                          key={participant.userId}
                          whileHover={{ scale: 1.05 }}
                          className="flex flex-col items-center gap-2 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {`${participant.firstName.charAt(0)}${participant.lastName.charAt(0)}`.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-center">
                            <div className="text-sm font-medium truncate max-w-[100px]">
                              {participant.firstName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {participant.skillLevel}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
              >
                <ArrowLeft size={20} weight="bold" />
              </Button>
              <div className="flex items-center gap-2">
                <Broadcast size={24} weight="fill" className="text-red-500 animate-pulse" />
                <span className="text-lg font-bold">Live Matches</span>
              </div>
            </div>
            <Badge variant="outline" className="text-red-500 border-red-500">
              <FireSimple size={16} weight="fill" className="mr-1" />
              {liveMatches.length} Live
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {liveMatches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-12 pb-12">
                <SoccerBall size={64} weight="duotone" className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nessuna Partita Live</h3>
                <p className="text-muted-foreground">
                  Non ci sono partite in corso al momento. Torna più tardi!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {liveMatches.length} {liveMatches.length === 1 ? 'Partita' : 'Partite'} in Corso
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card 
                    className="h-full cursor-pointer border-2 hover:border-primary/50 hover:shadow-xl transition-all overflow-hidden group"
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="absolute top-3 right-3 z-10">
                      <Badge variant="destructive" className="animate-pulse shadow-lg">
                        <Broadcast size={14} weight="fill" className="mr-1" />
                        LIVE
                      </Badge>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                            {match.venue.name}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin size={14} weight="fill" />
                            <span>{match.venue.city}</span>
                          </div>
                        </div>
                      </div>
                      <SkillBadge level={match.skillLevel} />
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-center flex-1">
                            <div className="text-3xl font-bold text-primary">
                              {match.score?.teamA || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">TEAM A</div>
                          </div>
                          
                          <SoccerBall size={20} weight="fill" className="text-primary/30" />
                          
                          <div className="text-center flex-1">
                            <div className="text-3xl font-bold text-secondary">
                              {match.score?.teamB || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">TEAM B</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                          <Timer size={16} weight="fill" className="text-accent" />
                          <span>{match.elapsedMinutes}'</span>
                          <span className={`text-xs ml-1 ${getStatusColor(match.elapsedMinutes)}`}>
                            {getMatchStatus(match.elapsedMinutes)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">{Math.min(90, match.elapsedMinutes)}/90 min</span>
                        </div>
                        <Progress 
                          value={(Math.min(90, match.elapsedMinutes) / 90) * 100} 
                          className="h-1.5"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Users size={18} weight="fill" className="text-primary" />
                          <span className="text-sm font-medium">
                            {match.currentPlayers}/{match.totalPlayers}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-accent hover:text-accent/80"
                        >
                          Visualizza →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
