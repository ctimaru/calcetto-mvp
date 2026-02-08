import { useEffect, useState } from 'react'
import { listMyMatches, setMatchStatus, getRosterCounts } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDots, Clock, MapPin, Users, CurrencyEuro, CheckCircle, HourglassMedium } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

function euro(cents: number) {
  return (cents / 100).toFixed(2) + ' €'
}

function dt(iso: string) {
  return new Date(iso).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' })
}

export function ManagerDashboard({ onCreate }: { onCreate: () => void }) {
  const [items, setItems] = useState<any[]>([])
  const [busy, setBusy] = useState(true)
  const [err, setErr] = useState('')

  async function refresh() {
    setBusy(true)
    setErr('')
    try {
      const data = await listMyMatches()
      setItems(data)
    } catch (e: any) {
      setErr(e.message ?? String(e))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Le mie partite</h2>
          <p className="text-muted-foreground mt-1">Gestisci le partite che hai creato</p>
        </div>
        <Button
          onClick={onCreate}
          className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          size="lg"
        >
          <CalendarDots size={20} weight="bold" />
          Crea partita
        </Button>
      </div>

      {err && (
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <p className="text-destructive text-sm">{err}</p>
        </Card>
      )}

      {busy && (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Caricamento…</div>
        </div>
      )}

      {!busy && items.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nessuna partita. Crea la prima in "draft".</p>
        </Card>
      )}

      <div className="grid gap-4">
        {items.map((m, idx) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <ManagerMatchCard match={m} onChanged={refresh} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ManagerMatchCard({ match, onChanged }: any) {
  const [counts, setCounts] = useState<any>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        setCounts(await getRosterCounts(match.id))
      } catch {
        setCounts(null)
      }
    })()
  }, [match.id])

  async function publish() {
    setBusy(true)
    try {
      await setMatchStatus(match.id, 'published')
      toast.success('Partita pubblicata con successo')
      onChanged()
    } catch (e: any) {
      toast.error(e.message ?? 'Errore durante la pubblicazione')
    } finally {
      setBusy(false)
    }
  }

  async function cancel() {
    setBusy(true)
    try {
      await setMatchStatus(match.id, 'canceled')
      toast.success('Partita annullata')
      onChanged()
    } catch (e: any) {
      toast.error(e.message ?? 'Errore durante l\'annullamento')
    } finally {
      setBusy(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Bozza</Badge>
      case 'published':
        return <Badge className="bg-accent text-accent-foreground">Pubblicata</Badge>
      case 'canceled':
        return <Badge variant="destructive">Annullata</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const fillRate = counts && match.players_needed > 0
    ? ((counts.confirmed / match.players_needed) * 100).toFixed(0)
    : 0

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CalendarDots size={20} weight="bold" className="text-primary" />
                <span className="text-xl font-bold">{dt(match.start_time)}</span>
              </div>
              {getStatusBadge(match.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={16} weight="fill" className="text-primary" />
              <span>{match.fields?.name ?? '—'}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} weight="fill" className="text-primary" />
              <span>{match.duration_min} minuti</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Users size={16} weight="fill" className="text-primary" />
              <span>{match.players_needed} giocatori</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <CurrencyEuro size={16} weight="fill" className="text-primary" />
              <span>{euro(match.price_per_player_cents)} a persona</span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} weight="fill" className="text-accent" />
                <span className="font-semibold">{counts?.confirmed ?? 0}</span>
                <span className="text-muted-foreground">/ {match.players_needed} confermati</span>
                <span className="text-xs text-muted-foreground">({fillRate}%)</span>
              </div>

              <div className="flex items-center gap-2">
                <HourglassMedium size={18} weight="fill" className="text-secondary" />
                <span className="font-semibold">{counts?.pending_payment ?? 0}</span>
                <span className="text-muted-foreground">in attesa</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex lg:flex-col gap-3 lg:min-w-[140px]">
          <Button
            disabled={busy || match.status !== 'draft'}
            onClick={publish}
            className="flex-1 lg:flex-none bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Pubblica
          </Button>
          <Button
            disabled={busy || match.status === 'canceled'}
            onClick={cancel}
            variant="destructive"
            className="flex-1 lg:flex-none"
          >
            Annulla
          </Button>
        </div>
      </div>
    </Card>
  )
}
