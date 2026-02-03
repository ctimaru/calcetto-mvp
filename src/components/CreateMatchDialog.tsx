import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { type User, type Match, type Venue, type SkillLevel } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Calendar, Clock, Users, MapPin, CurrencyEur, Trophy, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { generateId } from '@/lib/helpers'
import { motion, AnimatePresence } from 'framer-motion'

interface CreateMatchDialogProps {
  open: boolean
  onClose: () => void
  onMatchCreated: (match: Match) => void
  currentUser: User | null
}

export function CreateMatchDialog({ open, onClose, onMatchCreated, currentUser }: CreateMatchDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [venues, setVenues] = useKV<Venue[]>('venues', [])
  const [newVenue, setNewVenue] = useState<Partial<Venue> | null>(null)
  const [isCreatingVenue, setIsCreatingVenue] = useState(false)
  
  const [formData, setFormData] = useState({
    venueId: '',
    date: '',
    time: '',
    totalPlayers: 10,
    skillLevel: 'intermedio' as SkillLevel,
    price: 5,
    description: ''
  })

  useEffect(() => {
    if (open) {
      setStep(1)
      setFormData({
        venueId: '',
        date: '',
        time: '',
        totalPlayers: 10,
        skillLevel: 'intermedio' as SkillLevel,
        price: 5,
        description: ''
      })
      setIsCreatingVenue(false)
      setNewVenue(null)
    }
  }, [open])

  const handleCreateVenue = () => {
    if (!newVenue?.name || !newVenue?.address || !newVenue?.city || !newVenue?.phone) {
      toast.error('Compila tutti i campi del campo sportivo')
      return
    }

    const venue: Venue = {
      id: generateId(),
      name: newVenue.name,
      address: newVenue.address,
      city: newVenue.city,
      phone: newVenue.phone,
      rating: 0,
      totalReviews: 0
    }

    const updatedVenues = [...(venues || []), venue]
    setVenues(updatedVenues)
    
    setFormData({ ...formData, venueId: venue.id })
    setIsCreatingVenue(false)
    setNewVenue(null)
    toast.success('Campo sportivo creato con successo')
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.venueId) {
        toast.error('Seleziona un campo sportivo')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!formData.date || !formData.time) {
        toast.error('Compila data e ora')
        return
      }
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        toast.error('Seleziona una data futura')
        return
      }
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2)
    }
  }

  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error('Devi essere loggato per creare una partita')
      return
    }

    if (formData.totalPlayers < 2 || formData.totalPlayers > 22) {
      toast.error('Il numero di giocatori deve essere tra 2 e 22')
      return
    }

    if (formData.price < 0) {
      toast.error('Il prezzo non può essere negativo')
      return
    }

    const venue = (venues || []).find(v => v.id === formData.venueId)
    if (!venue) {
      toast.error('Campo sportivo non trovato')
      return
    }

    const match: Match = {
      id: generateId(),
      date: formData.date,
      time: formData.time,
      venue,
      totalPlayers: formData.totalPlayers,
      currentPlayers: 1,
      skillLevel: formData.skillLevel,
      price: formData.price,
      status: 'open',
      participants: [{
        userId: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        skillLevel: currentUser.skillLevel,
        joinedAt: new Date().toISOString(),
        paid: true
      }],
      createdBy: currentUser.id
    }

    const matches = await window.spark.kv.get<Match[]>('matches') || []
    await window.spark.kv.set('matches', [...matches, match])

    const updatedUser = {
      ...currentUser,
      joinedMatches: [...currentUser.joinedMatches, match.id]
    }
    await window.spark.kv.set('current-user', updatedUser)

    toast.success('Partita creata con successo!')
    onMatchCreated(match)
    onClose()
  }

  const selectedVenue = (venues || []).find(v => v.id === formData.venueId)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Plus size={28} weight="bold" className="text-accent" />
            Crea Nuova Partita
          </DialogTitle>
          <DialogDescription>
            Organizza una partita e invita altri giocatori a unirsi
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                s <= step ? 'bg-accent' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin size={24} weight="duotone" className="text-primary" />
                  Scegli il Campo
                </h3>
                
                {!isCreatingVenue ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="venue">Campo Sportivo</Label>
                      <Select
                        value={formData.venueId}
                        onValueChange={(value) => setFormData({ ...formData, venueId: value })}
                      >
                        <SelectTrigger id="venue" className="mt-2">
                          <SelectValue placeholder="Seleziona un campo" />
                        </SelectTrigger>
                        <SelectContent>
                          {(venues || []).map((venue) => (
                            <SelectItem key={venue.id} value={venue.id}>
                              {venue.name} - {venue.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedVenue && (
                      <div className="p-4 bg-muted rounded-lg space-y-2">
                        <p className="font-medium">{selectedVenue.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedVenue.address}</p>
                        <p className="text-sm text-muted-foreground">{selectedVenue.city}</p>
                        <p className="text-sm text-muted-foreground">Tel: {selectedVenue.phone}</p>
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsCreatingVenue(true)}
                    >
                      <Plus size={20} className="mr-2" />
                      Aggiungi Nuovo Campo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Nuovo Campo Sportivo</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsCreatingVenue(false)
                          setNewVenue(null)
                        }}
                      >
                        <X size={20} />
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor="venue-name">Nome Campo *</Label>
                      <Input
                        id="venue-name"
                        value={newVenue?.name || ''}
                        onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                        placeholder="es. Centro Sportivo San Siro"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="venue-address">Indirizzo *</Label>
                      <Input
                        id="venue-address"
                        value={newVenue?.address || ''}
                        onChange={(e) => setNewVenue({ ...newVenue, address: e.target.value })}
                        placeholder="es. Via dello Sport, 123"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="venue-city">Città *</Label>
                      <Input
                        id="venue-city"
                        value={newVenue?.city || ''}
                        onChange={(e) => setNewVenue({ ...newVenue, city: e.target.value })}
                        placeholder="es. Milano"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="venue-phone">Telefono *</Label>
                      <Input
                        id="venue-phone"
                        value={newVenue?.phone || ''}
                        onChange={(e) => setNewVenue({ ...newVenue, phone: e.target.value })}
                        placeholder="es. +39 02 1234567"
                        className="mt-2"
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={handleCreateVenue}
                      className="w-full bg-accent hover:bg-accent/90"
                    >
                      Salva Campo
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar size={24} weight="duotone" className="text-primary" />
                  Data e Ora
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="match-date">Data *</Label>
                    <Input
                      id="match-date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-2"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="match-time">Ora *</Label>
                    <Input
                      id="match-time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Trophy size={24} weight="duotone" className="text-primary" />
                  Dettagli Partita
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="skill-level">Livello di Gioco</Label>
                    <Select
                      value={formData.skillLevel}
                      onValueChange={(value) => setFormData({ ...formData, skillLevel: value as SkillLevel })}
                    >
                      <SelectTrigger id="skill-level" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="principiante">Principiante</SelectItem>
                        <SelectItem value="intermedio">Intermedio</SelectItem>
                        <SelectItem value="avanzato">Avanzato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="total-players">Numero Totale Giocatori</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, totalPlayers: Math.max(2, formData.totalPlayers - 2) })}
                      >
                        -
                      </Button>
                      <Input
                        id="total-players"
                        type="number"
                        value={formData.totalPlayers}
                        onChange={(e) => setFormData({ ...formData, totalPlayers: parseInt(e.target.value) || 10 })}
                        min={2}
                        max={22}
                        className="text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, totalPlayers: Math.min(22, formData.totalPlayers + 2) })}
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Users size={14} className="inline mr-1" />
                      Tipicamente 10 giocatori (5 vs 5)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="price">Prezzo per Giocatore (€)</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <CurrencyEur size={20} className="text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        min={0}
                        step={0.5}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrizione (opzionale)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Aggiungi note sulla partita..."
                      className="mt-2 min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              Indietro
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-accent hover:bg-accent/90"
            >
              Avanti
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-accent hover:bg-accent/90"
            >
              Crea Partita
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
