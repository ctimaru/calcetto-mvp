import { useState, useEffect } from 'react'
import { type Venue } from '@/lib/types'
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
import { Buildings, MapPin, Phone } from '@phosphor-icons/react'

interface EditVenueDialogProps {
  open: boolean
  venue: Venue | null
  onClose: () => void
  onVenueUpdated: (venue: Venue) => void
}

export function EditVenueDialog({ open, venue, onClose, onVenueUpdated }: EditVenueDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name,
        address: venue.address,
        city: venue.city,
        phone: venue.phone,
      })
    }
  }, [venue])

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!venue || !validateForm()) {
      return
    }

    const updatedVenue: Venue = {
      ...venue,
      name: formData.name.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      phone: formData.phone.trim(),
    }

    onVenueUpdated(updatedVenue)
    setErrors({})
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Buildings size={24} weight="duotone" className="text-primary" />
            Modifica Venue
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome Venue *</Label>
              <div className="relative">
                <Buildings
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="edit-name"
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
              <Label htmlFor="edit-address">Indirizzo *</Label>
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="edit-address"
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
              <Label htmlFor="edit-city">Città *</Label>
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="edit-city"
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
              <Label htmlFor="edit-phone">Telefono *</Label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="edit-phone"
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annulla
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Salva Modifiche
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
