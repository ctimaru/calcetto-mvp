import { type User, type SkillLevel } from '@/lib/types'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'

interface ProfileDialogProps {
  user: User | null
  open: boolean
  onClose: () => void
  onSave: (userData: Partial<User>) => void
}

export function ProfileDialog({ user, open, onClose, onSave }: ProfileDialogProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    skillLevel: 'intermedio' as SkillLevel,
    location: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age.toString(),
        skillLevel: user.skillLevel,
        location: user.location,
      })
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      firstName: formData.firstName,
      lastName: formData.lastName,
      age: parseInt(formData.age),
      skillLevel: formData.skillLevel,
      location: formData.location,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {user ? 'Modifica Profilo' : 'Completa il Profilo'}
          </DialogTitle>
          <DialogDescription>
            Inserisci i tuoi dati per trovare le partite più adatte a te
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Cognome</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Età</Label>
            <Input
              id="age"
              type="number"
              min="16"
              max="99"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skillLevel">Livello di Gioco</Label>
            <Select
              value={formData.skillLevel}
              onValueChange={(value) =>
                setFormData({ ...formData, skillLevel: value as SkillLevel })
              }
            >
              <SelectTrigger id="skillLevel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="principiante">Principiante</SelectItem>
                <SelectItem value="intermedio">Intermedio</SelectItem>
                <SelectItem value="avanzato">Avanzato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Città</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="es. Milano, Roma, Torino"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annulla
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              Salva
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
