import { useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Match, User } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  FunnelSimple,
  Trophy
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { euroFromCents, formatDateTime, getSkillLevelLabel, getSurfaceTypeLabel } from '@/lib/helpers'

interface MatchListProps {
  currentUser: User
  onSelectMatch: (matchId: string) => void
}

export function MatchList({ currentUser, onSelectMatch }: MatchListProps) {
  const [matches] = useKV<Match[]>('matches', [])
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [cityFilter, setCityFilter] = useState<string>(currentUser.homeCity)

  useEffect(() => {
    if (!matches) {
      setFilteredMatches([])
      return
    }

    const filtered = matches.filter(m => {
      if (m.status !== 'published') return false
      if (cityFilter && m.city !== cityFilter) return false
      
      const matchDate = new Date(m.startTime)
      const now = new Date()
      if (matchDate < now) return false
      
      return true
    })

    filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    
    setFilteredMatches(filtered)
  }, [matches, cityFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Partite disponibili</h2>
          <p className="text-muted-foreground">Trova la partita perfetta per te</p>
        </div>
        
        <div className="flex items-center gap-2">
          <FunnelSimple size={20} className="text-muted-foreground" />
          <Badge variant="outline" className="text-sm">
            {cityFilter}
          </Badge>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessuna partita disponibile</h3>
            <p className="text-muted-foreground text-sm">
              Non ci sono partite pubblicate nella tua città al momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card 
                className="hover:shadow-lg transition-all hover:border-primary/30 cursor-pointer group"
                onClick={() => onSelectMatch(match.id)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Calendar size={24} weight="duotone" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {formatDateTime(match.startTime)}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Clock size={16} />
                            <span>{match.durationMin} minuti</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="gap-1.5">
                          <Users size={14} weight="bold" />
                          {match.playersNeeded} giocatori
                        </Badge>
                        <Badge variant="outline">
                          {getSkillLevelLabel(match.skillLevel)}
                        </Badge>
                        {match.field && (
                          <Badge variant="outline" className="gap-1.5">
                            {getSurfaceTypeLabel(match.field.surfaceType)}
                          </Badge>
                        )}
                      </div>

                      {match.field && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin size={16} className="mt-0.5" />
                          <div>
                            <div className="font-medium text-foreground">{match.field.name}</div>
                            <div>{match.field.address}, {match.city}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex md:flex-col items-end md:items-end gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {euroFromCents(match.pricePerPlayerCents)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          per giocatore
                        </div>
                      </div>
                      
                      <Button 
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectMatch(match.id)
                        }}
                      >
                        Dettagli
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
