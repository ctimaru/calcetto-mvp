import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { type User, type SkillLevel } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  User as UserIcon, 
  MapPin, 
  EnvelopeSimple,
  Calendar,
  Trophy,
  CheckCircle,
  Star
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface ProfileCreationDialogProps {
  open: boolean
  onClose: () => void
  onProfileCreated: (user: User) => void
  editingUser?: User | null
}

export function ProfileCreationDialog({ open, onClose, onProfileCreated, editingUser }: ProfileCreationDialogProps) {
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState(editingUser?.firstName || '')
  const [lastName, setLastName] = useState(editingUser?.lastName || '')
  const [email, setEmail] = useState(editingUser?.email || '')
  const [age, setAge] = useState(editingUser?.age?.toString() || '')
  const [location, setLocation] = useState(editingUser?.location || '')
  const [skillLevel, setSkillLevel] = useState<SkillLevel | ''>(editingUser?.skillLevel || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 3

  const handleNext = () => {
    if (step === 1) {
      if (!firstName.trim() || !lastName.trim() || !email.trim()) {
        toast.error('Compila tutti i campi obbligatori')
        return
      }
      if (!email.includes('@')) {
        toast.error('Inserisci un indirizzo email valido')
        return
      }
    }
    
    if (step === 2) {
      if (!age || parseInt(age) < 16 || parseInt(age) > 100) {
        toast.error('Inserisci un\'età valida (16-100)')
        return
      }
      if (!location.trim()) {
        toast.error('Inserisci la tua città')
        return
      }
    }
    
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    if (!skillLevel) {
      toast.error('Seleziona il tuo livello di abilità')
      return
    }

    setIsSubmitting(true)

    try {
      const user: User = {
        id: editingUser?.id || `user-${Date.now()}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        age: parseInt(age),
        location: location.trim(),
        skillLevel: skillLevel as SkillLevel,
        role: editingUser?.role || 'PLAYER',
        joinedMatches: editingUser?.joinedMatches || [],
        createdMatches: editingUser?.createdMatches || [],
        createdAt: editingUser?.createdAt || new Date().toISOString()
      }

      await new Promise(resolve => setTimeout(resolve, 800))

      onProfileCreated(user)
      
      toast.success(editingUser ? 'Profilo aggiornato con successo!' : 'Profilo creato con successo!')
      
      setTimeout(() => {
        onClose()
        setStep(1)
      }, 300)
    } catch (error) {
      toast.error('Si è verificato un errore. Riprova.')
      setIsSubmitting(false)
    }
  }

  const getSkillLevelInfo = (level: SkillLevel) => {
    const info = {
      principiante: {
        label: 'Principiante',
        description: 'Nuovo al calcetto o giochi occasionalmente',
        color: 'bg-accent/20 text-accent-foreground border-accent/40'
      },
      intermedio: {
        label: 'Intermedio',
        description: 'Giochi regolarmente, buone capacità tecniche',
        color: 'bg-secondary/20 text-secondary-foreground border-secondary/40'
      },
      avanzato: {
        label: 'Avanzato',
        description: 'Giocatore esperto con ottime capacità',
        color: 'bg-primary/20 text-primary-foreground border-primary/40'
      }
    }
    return info[level]
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editingUser ? 'Modifica Profilo' : 'Crea il Tuo Profilo'}
          </DialogTitle>
          <DialogDescription>
            {editingUser ? 'Aggiorna le tue informazioni personali' : 'Completa il tuo profilo per iniziare a giocare'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index + 1 <= step 
                    ? 'bg-accent w-12' 
                    : 'bg-muted w-8'
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
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <UserIcon size={24} className="text-primary" weight="duotone" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Informazioni Personali</h3>
                    <p className="text-sm text-muted-foreground">Come ti chiami?</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome *</Label>
                  <Input
                    id="firstName"
                    placeholder="Mario"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Cognome *</Label>
                  <Input
                    id="lastName"
                    placeholder="Rossi"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="mario.rossi@esempio.it"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
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
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <MapPin size={24} className="text-secondary" weight="duotone" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Dove Giochi?</h3>
                    <p className="text-sm text-muted-foreground">Età e posizione</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Età *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    min="16"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Città *</Label>
                  <Input
                    id="location"
                    placeholder="Milano"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ti aiuteremo a trovare partite nella tua zona
                  </p>
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
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Trophy size={24} className="text-accent" weight="duotone" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Livello di Abilità</h3>
                    <p className="text-sm text-muted-foreground">Come valuti le tue capacità?</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(['principiante', 'intermedio', 'avanzato'] as SkillLevel[]).map((level) => {
                    const info = getSkillLevelInfo(level)
                    const isSelected = skillLevel === level
                    
                    return (
                      <button
                        key={level}
                        onClick={() => setSkillLevel(level)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected 
                            ? 'border-accent bg-accent/5 shadow-sm' 
                            : 'border-border hover:border-accent/50 hover:bg-accent/5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{info.label}</h4>
                              <div className="flex gap-0.5">
                                {Array.from({ length: level === 'principiante' ? 1 : level === 'intermedio' ? 2 : 3 }).map((_, i) => (
                                  <Star key={i} size={14} weight="fill" className="text-accent" />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{info.description}</p>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                              <CheckCircle size={24} className="text-accent" weight="fill" />
                            </motion.div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                className="w-24"
              >
                Indietro
              </Button>
            )}
            
            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Continua
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !skillLevel}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ⚽
                    </motion.div>
                    Salvataggio...
                  </span>
                ) : (
                  <>
                    <CheckCircle size={20} weight="bold" className="mr-2" />
                    {editingUser ? 'Salva Modifiche' : 'Completa Profilo'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
