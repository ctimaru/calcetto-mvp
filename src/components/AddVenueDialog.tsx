import { useState } from 'react'
import { type Venue } from '@/lib/types'
import { generateId } from '@/lib/helpers'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Buildings, MapPin, Phone, Clock, CurrencyEur } from '@phosphor-icons/react'

interface AddVenueDialogProps {
  open: boolean
  onClose: () => void
  onVenueAdded: (venue: Venue) => void
}

export function AddVenueDialog({ open, onClose, onVenueAdded }: AddVenueDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    operatingStart: '08:00',
    operatingEnd: '23:00',
    pricePerHour: '50',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Il nome è obbligatorio'
    }
    if (!formData.address.trim()) {
      newErrors.address = "L'indirizzo è obbligatorio"
    }
    if (!formData.city.trim()) {
      newErrors.city = 'La città è obbligatoria'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Il telefono è obbligatorio'
    } else if (!/^\+?[\d\s-]+$/.test(formData.phone)) {
      newErrors.phone = 'Formato telefono non valido'
    }
    if (!formData.pricePerHour || parseFloat(formData.pricePerHour) <= 0) {
      newErrors.pricePerHour = 'Inserisci un prezzo valido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const newVenue: Venue = {
      id: generateId(),
      name: formData.name.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      phone: formData.phone.trim(),
      rating: 0,
      totalReviews: 0,
      operatingHours: {
        start: formData.operatingStart,
        end: formData.operatingEnd,
      },
      pricePerHour: parseFloat(formData.pricePerHour),
    }

    onVenueAdded(newVenue)
    setFormData({ 
      name: '', 
      address: '', 
      city: '', 
      phone: '',
      operatingStart: '08:00',
      operatingEnd: '23:00',
      pricePerHour: '50',
    })
    setErrors({})
  }

  const handleClose = () => {
    setFormData({ 
      name: '', 
      address: '', 
      city: '', 
      phone: '',
      operatingStart: '08:00',
      operatingEnd: '23:00',
      pricePerHour: '50',
    })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Buildings size={24} weight="duotone" className="text-primary" />
            Aggiungi Nuovo Venue
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Venue *</Label>
              <div className="relative">
                <Buildings
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="name"
                  placeholder="Es. Centro Sportivo San Siro"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`pl-10 ${errors.name ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Indirizzo *</Label>
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="address"
                  placeholder="Es. Via Piccolomini, 5"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`pl-10 ${errors.address ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Città *</Label>
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="city"
                  placeholder="Es. Milano"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`pl-10 ${errors.city ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono *</Label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="phone"
                  placeholder="Es. +39 02 1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="operatingStart">Apertura</Label>
                <div className="relative">
                  <Clock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="operatingStart"
                    type="time"
                    value={formData.operatingStart}
                    onChange={(e) => setFormData({ ...formData, operatingStart: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="operatingEnd">Chiusura</Label>
                <div className="relative">
                  <Clock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="operatingEnd"
                    type="time"
                    value={formData.operatingEnd}
                    onChange={(e) => setFormData({ ...formData, operatingEnd: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerHour">Prezzo per Ora (€) *</Label>
              <div className="relative">
                <CurrencyEur
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="pricePerHour"
                  type="number"
                  min="0"
                  step="5"
                  placeholder="Es. 50"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                  className={`pl-10 ${errors.pricePerHour ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.pricePerHour && (
                <p className="text-sm text-destructive">{errors.pricePerHour}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annulla
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Aggiungi Venue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
