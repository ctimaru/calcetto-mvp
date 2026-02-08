import { useEffect, useState } from 'react'
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
import { listMatches } from '@/lib/api'
import { toast } from 'sonner'

interface MatchListProps {
  userId: string
  city: string
  onSelectMatch: (matchId: string) => void
}

interface SupabaseMatch {
  id: string
  city: string
  start_time: string
  duration_min: number
  skill_level: string
  players_needed: number
  price_per_player_cents: number
  status: string
  fields?: {
    name: string
    address: string
  }
}

export function MatchList({ userId, city, onSelectMatch }: MatchListProps) {
  const [matches, setMatches] = useState<SupabaseMatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMatches() {
      setLoading(true)
      try {
        const data = await listMatches(city)
        setMatches(data)
      } catch (error: any) {
        toast.error(error.message || 'Errore nel caricamento delle partite')
      } finally {
        setLoading(false)
      }
    }
    fetchMatches()
  }, [city])

  function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatPrice(cents: number) {
    return `€${(cents / 100).toFixed(2)}`
  }

  function getSkillLabel(level: string) {
    const labels: Record<string, string> = {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzato',
      pro: 'Pro'
    }
    return labels[level] || level
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Caricamento partite...</p>
        </CardContent>
      </Card>
    )
  }

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
            {city}
          </Badge>
        </div>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessuna partita disponibile</h3>
            <p className="text-muted-foreground text-sm">
              Non ci sono partite pubblicate a {city} al momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {matches.map((match, index) => (
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
                            {formatDateTime(match.start_time)}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Clock size={16} />
                            <span>{match.duration_min} minuti</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="gap-1.5">
                          <Users size={14} weight="bold" />
                          {match.players_needed} giocatori
                        </Badge>
                        <Badge variant="outline">
                          {getSkillLabel(match.skill_level)}
                        </Badge>
                      </div>

                      {match.fields && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin size={16} className="mt-0.5" />
                          <div>
                            <div className="font-medium text-foreground">{match.fields.name}</div>
                            <div>{match.fields.address}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex md:flex-col items-end md:items-end gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(match.price_per_player_cents)}
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
