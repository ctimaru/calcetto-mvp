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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold mb-2">Partite a {city}</h2>
          <p className="text-lg text-muted-foreground">
            {matches.length} {matches.length === 1 ? 'partita disponibile' : 'partite disponibili'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <FunnelSimple size={18} />
            Filtri
          </Button>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <MapPin size={14} className="mr-1.5" weight="bold" />
            {city}
          </Badge>
        </div>
      </div>

      {matches.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Trophy size={40} weight="duotone" className="text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Nessuna partita disponibile</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Non ci sono partite pubblicate a {city} al momento. Torna più tardi o contatta un manager per organizzare una nuova partita.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Card 
                className="hover:shadow-xl transition-all duration-300 hover:border-primary/40 cursor-pointer group overflow-hidden"
                onClick={() => onSelectMatch(match.id)}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div 
                      className="w-full md:w-64 h-48 md:h-auto bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 flex items-center justify-center relative overflow-hidden"
                    >
                      <div className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: `repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 10px,
                            oklch(0.45 0.12 155 / 0.1) 10px,
                            oklch(0.45 0.12 155 / 0.1) 20px
                          )`
                        }}
                      />
                      <Trophy size={64} weight="duotone" className="text-primary/60 relative z-10" />
                    </div>

                    <div className="flex-1 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="font-bold text-2xl mb-2 group-hover:text-primary transition-colors">
                              {formatDateTime(match.start_time)}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Clock size={16} weight="bold" />
                                <span>{match.duration_min} min</span>
                              </div>
                              <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                              <div className="flex items-center gap-1.5">
                                <Users size={16} weight="bold" />
                                <span>{match.players_needed} giocatori</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="px-3 py-1">
                              {getSkillLabel(match.skill_level)}
                            </Badge>
                          </div>

                          {match.fields && (
                            <div className="flex items-start gap-2.5">
                              <MapPin size={18} className="mt-0.5 text-primary" weight="fill" />
                              <div>
                                <div className="font-semibold text-foreground">{match.fields.name}</div>
                                <div className="text-sm text-muted-foreground">{match.fields.address}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex lg:flex-col items-start lg:items-end justify-between lg:justify-start gap-4 pt-2">
                          <div className="text-left lg:text-right">
                            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                              Prezzo
                            </div>
                            <div className="text-3xl font-bold text-primary">
                              {formatPrice(match.price_per_player_cents)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              a persona
                            </div>
                          </div>
                          
                          <Button 
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg group-hover:shadow-xl transition-all"
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectMatch(match.id)
                            }}
                          >
                            Prenota ora
                          </Button>
                        </div>
                      </div>
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
