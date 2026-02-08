import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, Match, User } from '@/lib/types'
import { Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CreateMatchDialogProps {
  open: boolean
  onClose: () => void
  currentUser: User
}

export function CreateMatchDialog({ open, onClose, currentUser }: CreateMatchDialogProps) {
  const [fields] = useKV<Field[]>('fields', [])
  const [fieldId, setFieldId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [durationMin, setDurationMin] = useState('90')
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'pro' | 'mixed'>('mixed')
  const [playersNeeded, setPlayersNeeded] = useState('10')
  const [pricePerPlayer, setPricePerPlayer] = useState('15')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (open) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setDate(tomorrow.toISOString().split('T')[0])
      setTime('19:00')
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)

    try {
      if (!fieldId) {
        toast.error('Seleziona un campo')
        return
      }

      const field = fields?.find(f => f.id === fieldId)
      if (!field) {
        toast.error('Campo non trovato')
        return
      }

      const startTime = new Date(`${date}T${time}`)
      
      const matches = await window.spark.kv.get<Match[]>('matches') || []
      
      const newMatch: Match = {
        id: `match-${Date.now()}`,
        fieldId,
        field,
        city: field.city,
        startTime: startTime.toISOString(),
        durationMin: parseInt(durationMin),
        skillLevel,
        playersNeeded: parseInt(playersNeeded),
        pricePerPlayerCents: Math.round(parseFloat(pricePerPlayer) * 100),
        status: 'published',
        createdBy: currentUser.id,
        createdAt: new Date().toISOString()
      }

      await window.spark.kv.set('matches', [...matches, newMatch])
      
      toast.success('Partita creata con successo!')
      onClose()
      
      setFieldId('')
      setDurationMin('90')
      setSkillLevel('mixed')
      setPlayersNeeded('10')
      setPricePerPlayer('15')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore durante la creazione')
    } finally {
      setIsCreating(false)
    }
  }

  if (currentUser.role === 'player') {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus size={24} weight="bold" className="text-primary" />
            Crea nuova partita
          </DialogTitle>
          <DialogDescription>
            Pubblica una nuova partita per i giocatori
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="field">Campo *</Label>
            <Select value={fieldId} onValueChange={setFieldId} required disabled={isCreating}>
              <SelectTrigger id="field">
                <SelectValue placeholder="Seleziona un campo" />
              </SelectTrigger>
              <SelectContent>
                {fields?.map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.name} - {field.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Ora *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                disabled={isCreating}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durata (minuti) *</Label>
            <Input
              id="duration"
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              min="30"
              max="180"
              step="15"
              required
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skill">Livello di gioco *</Label>
            <Select 
              value={skillLevel} 
              onValueChange={(val) => setSkillLevel(val as any)}
              disabled={isCreating}
            >
              <SelectTrigger id="skill">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Principiante</SelectItem>
                <SelectItem value="intermediate">Intermedio</SelectItem>
                <SelectItem value="advanced">Avanzato</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="mixed">Misto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="players">Numero giocatori *</Label>
            <Input
              id="players"
              type="number"
              value={playersNeeded}
              onChange={(e) => setPlayersNeeded(e.target.value)}
              min="4"
              max="22"
              required
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Prezzo per giocatore (€) *</Label>
            <Input
              id="price"
              type="number"
              value={pricePerPlayer}
              onChange={(e) => setPricePerPlayer(e.target.value)}
              min="0"
              step="0.5"
              required
              disabled={isCreating}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isCreating}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button 
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isCreating ? 'Creazione...' : 'Crea partita'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
