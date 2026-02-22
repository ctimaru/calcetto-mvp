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
      
      if (sessErr) {
        console.error("Session error:", sessErr)
        throw new Error("Errore nel recuperare la sessione. Prova a ricaricare la pagina.")
      }

      const token = sessData.session?.access_token
      
      if (!token) {
        console.error("No access token found")
        throw new Error("Non sei loggato (manca access_token). Prova a fare logout e login.")
      }

      console.log("Session user:", sessData.session?.user?.id)
      console.log("Has token:", !!token)

      const res = await supabase.functions.invoke('create-payment-intent', {
        body: { matchId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('EDGE invoke res:', res)

      if (res.error) {
        const status = (res.error as any)?.context?.status
        const body = (res.error as any)?.context?.body
        console.error('EDGE status:', status)
        console.error('EDGE body:', body)
        throw new Error(`Edge error ${status}: ${JSON.stringify(body)}`)
      }

      console.log('EDGE data:', res.data)

      if (res.data?.alreadyConfirmed) {
        await reloadParticipation()
        toast.success('La partecipazione è già confermata!')
        return
      }

      if (!res.data?.clientSecret) {
        throw new Error('Missing clientSecret from create-payment-intent')
      }
      
      setClientSecret(res.data.clientSecret)
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
                  {formatPrice(match.price_per_player_cents)}
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
                    <div className="font-semibold">{formatDateTime(match.start_time)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Clock size={24} weight="duotone" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Durata</div>
                    <div className="font-semibold">{match.duration_min} minuti</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Users size={24} weight="duotone" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Giocatori richiesti</div>
                    <div className="font-semibold">
                      {match.players_needed} giocatori
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {match.fields && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                      <MapPin size={24} weight="duotone" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Campo</div>
                      <div className="font-semibold">{match.fields.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {match.fields.address}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Livello di gioco</div>
                  <Badge variant="outline" className="text-base">
                    {getSkillLabel(match.skill_level)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Città</div>
                  <Badge variant="outline">
                    {match.city}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {!participation && (
              <div className="space-y-4">
                <Alert>
                  <CreditCard size={16} />
                  <AlertDescription>
                    Il pagamento è obbligatorio per confermare la partecipazione
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={handleJoin}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="lg"
                >
                  Partecipa alla partita
                </Button>
              </div>
            )}

            {participation && participation.status === 'pending_payment' && (
              <div className="space-y-4">
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Warning size={16} className="text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>In attesa di pagamento</strong>
                    <div className="mt-2 text-sm">
                      Completa il pagamento per confermare. La conferma definitiva arriva via webhook.
                    </div>
                  </AlertDescription>
                </Alert>

                {!clientSecret ? (
                  <Button
                    onClick={startPayment}
                    disabled={payBusy}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    size="lg"
                  >
                    <CreditCard size={20} weight="bold" className="mr-2" />
                    {payBusy ? 'Avvio pagamento…' : 'Paga ora'}
                  </Button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
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
              <Alert className="bg-green-50 border-green-200">
                <CreditCard size={16} className="text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Partecipazione confermata!</strong>
                  <div className="mt-1 text-sm">
                    Ci vediamo in campo!
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
