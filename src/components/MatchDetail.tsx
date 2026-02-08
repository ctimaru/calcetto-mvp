import { useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Match, User, Participation } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft,
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  CreditCard,
  CheckCircle,
  Warning,
  ChatCircle
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { euroFromCents, formatDateTime, getSkillLevelLabel, getSurfaceTypeLabel } from '@/lib/helpers'
import { toast } from 'sonner'
import { PaymentDialog } from './PaymentDialog'
import { MatchChat } from './MatchChat'

interface MatchDetailProps {
  matchId: string
  currentUser: User
  onBack: () => void
}

export function MatchDetail({ matchId, currentUser, onBack }: MatchDetailProps) {
  const [matches] = useKV<Match[]>('matches', [])
  const [participations] = useKV<Participation[]>('participations', [])
  const [match, setMatch] = useState<Match | null>(null)
  const [userParticipation, setUserParticipation] = useState<Participation | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const foundMatch = matches?.find(m => m.id === matchId)
    setMatch(foundMatch || null)
  }, [matches, matchId])

  useEffect(() => {
    const participation = participations?.find(p => 
      p.matchId === matchId && p.userId === currentUser.id
    )
    setUserParticipation(participation || null)
  }, [participations, matchId, currentUser.id])

  async function handleJoin() {
    if (!match) return
    
    setIsJoining(true)
    setError('')

    try {
      const existingParticipations = await window.spark.kv.get<Participation[]>('participations') || []
      
      const alreadyJoined = existingParticipations.find(p => 
        p.matchId === match.id && p.userId === currentUser.id
      )
      
      if (alreadyJoined) {
        setError('Sei già iscritto a questa partita.')
        return
      }

      const newParticipation: Participation = {
        id: `part-${Date.now()}`,
        matchId: match.id,
        userId: currentUser.id,
        status: 'pending_payment',
        createdAt: new Date().toISOString()
      }

      await window.spark.kv.set('participations', [...existingParticipations, newParticipation])
      setUserParticipation(newParticipation)
      
      toast.success('Prenotazione creata! Completa il pagamento per confermare.')
      setIsPaymentDialogOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'iscrizione')
      toast.error('Errore durante l\'iscrizione alla partita')
    } finally {
      setIsJoining(false)
    }
  }

  async function handlePaymentComplete() {
    if (!userParticipation) return

    const allParticipations = await window.spark.kv.get<Participation[]>('participations') || []
    const updated = allParticipations.map(p => 
      p.id === userParticipation.id 
        ? { ...p, status: 'confirmed' as const, paidAt: new Date().toISOString() }
        : p
    )
    await window.spark.kv.set('participations', updated)
    
    const updatedParticipation = updated.find(p => p.id === userParticipation.id)
    if (updatedParticipation) {
      setUserParticipation(updatedParticipation)
    }
    
    setIsPaymentDialogOpen(false)
    toast.success('Pagamento completato! Partecipazione confermata.')
  }

  if (!match) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft size={20} />
          Indietro
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Partita non trovata</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const confirmedCount = participations?.filter(p => 
    p.matchId === match.id && p.status === 'confirmed'
  ).length || 0

  const isConfirmed = userParticipation?.status === 'confirmed'

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 hover:bg-primary/10">
        <ArrowLeft size={20} />
        Torna alle partite
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">Dettaglio Partita</CardTitle>
                <Badge variant="secondary" className="w-fit">
                  {match.status === 'published' ? 'Pubblicata' : match.status}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {euroFromCents(match.pricePerPlayerCents)}
                </div>
                <div className="text-sm text-muted-foreground">
                  per giocatore
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <Warning size={16} />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Calendar size={24} weight="duotone" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Data e ora</div>
                    <div className="font-semibold">{formatDateTime(match.startTime)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Clock size={24} weight="duotone" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Durata</div>
                    <div className="font-semibold">{match.durationMin} minuti</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Users size={24} weight="duotone" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Giocatori</div>
                    <div className="font-semibold">
                      {confirmedCount} / {match.playersNeeded} confermati
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {match.field && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                      <MapPin size={24} weight="duotone" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Campo</div>
                      <div className="font-semibold">{match.field.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {match.field.address}, {match.city}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Livello di gioco</div>
                  <Badge variant="outline" className="text-base">
                    {getSkillLevelLabel(match.skillLevel)}
                  </Badge>
                </div>

                {match.field && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Superficie</div>
                    <Badge variant="outline">
                      {getSurfaceTypeLabel(match.field.surfaceType)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {!userParticipation && (
              <div className="space-y-4">
                <Alert>
                  <CreditCard size={16} />
                  <AlertDescription>
                    Il pagamento è obbligatorio per confermare la partecipazione
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="lg"
                >
                  {isJoining ? 'Iscrizione...' : 'Partecipa alla partita'}
                </Button>
              </div>
            )}

            {userParticipation?.status === 'pending_payment' && (
              <Alert className="bg-secondary/10 border-secondary/30">
                <Warning size={16} className="text-secondary" />
                <AlertDescription className="flex items-center justify-between">
                  <span>In attesa di pagamento</span>
                  <Button 
                    size="sm"
                    onClick={() => setIsPaymentDialogOpen(true)}
                    className="bg-secondary hover:bg-secondary/90"
                  >
                    Paga ora
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {isConfirmed && (
              <Alert className="bg-accent/10 border-accent/30">
                <CheckCircle size={16} weight="fill" className="text-accent-foreground" />
                <AlertDescription className="text-accent-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Partecipazione confermata!</span>
                    <ChatCircle size={16} weight="fill" />
                    <span className="text-sm">Chat disponibile qui sotto</span>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {isConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <MatchChat matchId={match.id} currentUser={currentUser} />
          </motion.div>
        )}
      </motion.div>

      {userParticipation && (
        <PaymentDialog
          open={isPaymentDialogOpen}
          onClose={() => setIsPaymentDialogOpen(false)}
          amount={match.pricePerPlayerCents}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  )
}
