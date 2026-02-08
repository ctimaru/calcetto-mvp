import { useEffect, useState } from 'react'
import { listActiveFields, createMatchDraft } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export function CreateMatchForm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [fields, setFields] = useState<any[]>([])
  const [city, setCity] = useState('Torino')
  const [fieldId, setFieldId] = useState<string>('')
  const [start, setStart] = useState<string>('')
  const [duration, setDuration] = useState<number>(90)
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [playersNeeded, setPlayersNeeded] = useState<number>(10)
  const [priceCents, setPriceCents] = useState<number>(800)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    (async () => {
      const f = await listActiveFields(city)
      setFields(f)
      if (f.length && !fieldId) setFieldId(f[0].id)
    })()
  }, [city])

  async function submit() {
    setErr('')
    setBusy(true)
    try {
      if (!start) throw new Error('Imposta data e ora.')
      await createMatchDraft({
        userId,
        city,
        field_id: fieldId || null,
        start_time: new Date(start).toISOString(),
        duration_min: duration,
        skill_level: level,
        players_needed: playersNeeded,
        price_per_player_cents: priceCents,
      })
      toast.success('Partita creata in bozza')
      onDone()
    } catch (e: any) {
      setErr(e.message ?? String(e))
      toast.error(e.message ?? 'Errore durante la creazione')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Crea partita (bozza)</h2>
          <p className="text-muted-foreground text-sm mt-1">
            La partita verrà salvata come bozza. Pubblicala quando è pronta.
          </p>
        </div>

        {err && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{err}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Città</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="field">Campo</Label>
            <Select value={fieldId} onValueChange={setFieldId}>
              <SelectTrigger id="field">
                <SelectValue placeholder="Seleziona campo" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name} ({f.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="start">Data e ora</Label>
            <Input
              id="start"
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durata (minuti)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Livello</Label>
            <Select value={level} onValueChange={(v: any) => setLevel(v)}>
              <SelectTrigger id="level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Principiante</SelectItem>
                <SelectItem value="intermediate">Intermedio</SelectItem>
                <SelectItem value="advanced">Avanzato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="players">Giocatori richiesti</Label>
            <Input
              id="players"
              type="number"
              value={playersNeeded}
              onChange={(e) => setPlayersNeeded(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Prezzo per giocatore (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={(priceCents / 100).toFixed(2)}
              onChange={(e) => setPriceCents(Math.round(Number(e.target.value) * 100))}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button disabled={busy} onClick={submit} className="flex-1 sm:flex-none">
            {busy ? 'Salvataggio…' : 'Salva come bozza'}
          </Button>
          <Button variant="outline" onClick={onDone} className="flex-1 sm:flex-none">
            Annulla
          </Button>
        </div>
      </div>
    </Card>
  )
}
