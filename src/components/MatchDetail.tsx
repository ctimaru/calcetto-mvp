import { useEffect, useState } from 'react'
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
  Warning
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { getMatchDetail, getMyParticipation, joinMatch } from '@/lib/api'
import { supabase } from '@/lib/supabaseClient'
import { Checkout } from '@/components/Checkout'

interface MatchDetailProps {
  matchId: string
  userId: string
  onBack: () => void
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
  field_id?: string
  fields?: {
    name: string
    address: string
  }
}

interface Participation {
  id: string
  status: string
  created_at: string
}

export function MatchDetail({ matchId, userId, onBack }: MatchDetailProps) {
  const [match, setMatch] = useState<SupabaseMatch | null>(null)
  const [participation, setParticipation] = useState<Participation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState<string>('')
  const [payBusy, setPayBusy] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError('')
      try {
        const matchData = await getMatchDetail(matchId)
        setMatch(matchData)
        
        const partData = await getMyParticipation(matchId, userId)
        setParticipation(partData)
      } catch (err: any) {
        setError(err.message || 'Errore nel caricamento')
        toast.error(err.message || 'Errore nel caricamento dei dati')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [matchId, userId])

  async function handleJoin() {
    setError('')
    try {
      const part = await joinMatch(matchId, userId)
      setParticipation(part)
      toast.success('Prenotazione creata! In attesa di pagamento.')
    } catch (err: any) {
      const msg = err.message || String(err)
      if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique')) {
        setError('Sei già iscritto. Completa il pagamento per confermare.')
      } else {
        setError(msg)
      }
      toast.error(msg)
    }
  }

  async function startPayment() {
    setPayBusy(true)
    setClientSecret('')
    setError('')
    try {
      const { data: sessData, error: sessErr } = await supabase.auth.getSession()
      
      if (sessErr) throw sessErr

      const token = sessData.session?.access_token
      if (!token) throw new Error("Sessione assente: fai login prima di pagare.")

      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { matchId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (error) {
        console.error("Edge error", error, (error as any)?.context)
        throw error
      }

      if (data?.alreadyConfirmed) {
        await reloadParticipation()
        toast.success('La partecipazione è già confermata!')
        return
      }

      if (!data?.clientSecret) {
        throw new Error('Missing clientSecret from create-payment-intent')
      }
      
      setClientSecret(data.clientSecret)
    } catch (e: any) {
      const errorMsg = e.message ?? String(e)
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setPayBusy(false)
    }
  }

  async function reloadParticipation() {
    try {
      const partData = await getMyParticipation(matchId, userId)
      setParticipation(partData)
    } catch (err: any) {
      console.warn('Error reloading participation:', err)
    }
  }

  async function pollUntilConfirmed() {
    toast.info('In attesa della conferma dal server...')
    
    for (let i = 0; i < 6; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      try {
        const { data, error } = await supabase
          .from('participations')
          .select('id, status')
          .eq('match_id', matchId)
          .eq('user_id', userId)
          .maybeSingle()

        if (!error && data?.status === 'confirmed') {
          setParticipation((prev: any) => ({ ...prev, status: 'confirmed' }))
          setClientSecret('')
          toast.success('Pagamento confermato! Ci vediamo in campo!')
          return
        }
      } catch (err) {
        console.warn('Polling error:', err)
      }
    }
    
    toast.warning('Se non si aggiorna, ricarica la pagina')
  }

  function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
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
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft size={20} />
          Indietro
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Caricamento dettaglio...</p>
          </CardContent>
        </Card>
      </div>
    )
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

  return (
    <div className="space-y-6 pb-12">
      <Button variant="ghost" onClick={onBack} className="gap-2 hover:bg-primary/10">
        <ArrowLeft size={20} weight="bold" />
        Torna alle partite
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div 
              className="w-full h-64 bg-gradient-to-br from-primary/30 via-accent/30 to-secondary/30 flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 15px,
                    oklch(0.45 0.12 155 / 0.15) 15px,
                    oklch(0.45 0.12 155 / 0.15) 30px
                  )`
                }}
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative z-10 text-center"
              >
                <Calendar size={96} weight="duotone" className="text-primary/80 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-foreground">
                  {formatDateTime(match.start_time)}
                </h1>
              </motion.div>
            </div>
            
            <CardContent className="p-6 space-y-6">
              {error && (
                <Alert variant="destructive">
                  <Warning size={16} />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <h2 className="text-2xl font-bold mb-4">Dettagli della partita</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <Clock size={28} weight="duotone" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-muted-foreground">Durata</div>
                      <div className="text-lg font-bold">{match.duration_min} minuti</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <Users size={28} weight="duotone" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-muted-foreground">Giocatori</div>
                      <div className="text-lg font-bold">{match.players_needed} giocatori richiesti</div>
                    </div>
                  </div>

                  {match.fields && (
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
                        <MapPin size={28} weight="duotone" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-muted-foreground">Campo</div>
                        <div className="text-lg font-bold">{match.fields.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {match.fields.address}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <Badge variant="secondary" className="text-base px-4 py-2">
                      {getSkillLabel(match.skill_level)}
                    </Badge>
                    <Badge variant="outline" className="text-base px-4 py-2">
                      {match.city}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Checkout
                          clientSecret={clientSecret}
                          onCancel={() => setClientSecret('')}
                          onSuccess={async () => {
                            await pollUntilConfirmed()
                          }}
                        />
                      </motion.div>
                    )}
                  </div>
                )}

                {participation && participation.status === 'confirmed' && (
                  <Alert className="bg-emerald-50 border-emerald-200">
                    <CreditCard size={16} className="text-emerald-600" />
                    <AlertDescription className="text-emerald-900">
                      <strong className="text-lg">✓ Confermato!</strong>
                      <div className="mt-2 text-sm">
                        Il tuo posto è confermato. Ci vediamo in campo!
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <Separator />
                
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Pagamento sicuro e protetto</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Conferma immediata via email</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Chat con i partecipanti</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
