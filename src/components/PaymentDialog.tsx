import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, CheckCircle } from '@phosphor-icons/react'
import { euroFromCents } from '@/lib/helpers'
import { motion } from 'framer-motion'

interface PaymentDialogProps {
  open: boolean
  onClose: () => void
  amount: number
  onPaymentComplete: () => void
}

export function PaymentDialog({ open, onClose, amount, onPaymentComplete }: PaymentDialogProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  function formatCardNumber(value: string) {
    const cleaned = value.replace(/\s/g, '')
    const groups = cleaned.match(/.{1,4}/g) || []
    return groups.join(' ').slice(0, 19)
  }

  function formatExpiry(value: string) {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsProcessing(true)

    await new Promise(resolve => setTimeout(resolve, 2000))

    setIsProcessing(false)
    onPaymentComplete()
    
    setCardNumber('')
    setExpiry('')
    setCvv('')
    setName('')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard size={24} weight="duotone" className="text-primary" />
            Pagamento
          </DialogTitle>
          <DialogDescription>
            Completa il pagamento per confermare la tua partecipazione
          </DialogDescription>
        </DialogHeader>

        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 my-4">
          <div className="text-sm text-muted-foreground mb-1">Totale da pagare</div>
          <div className="text-3xl font-bold text-accent-foreground">
            {euroFromCents(amount)}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-name">Nome sulla carta</Label>
            <Input
              id="card-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="MARIO ROSSI"
              required
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-number">Numero carta</Label>
            <Input
              id="card-number"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
              disabled={isProcessing}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Scadenza</Label>
              <Input
                id="expiry"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/AA"
                maxLength={5}
                required
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="123"
                maxLength={3}
                required
                disabled={isProcessing}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isProcessing}
            >
              Annulla
            </Button>
            <Button 
              type="submit"
              disabled={isProcessing}
              className="bg-primary hover:bg-primary/90"
            >
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  Elaborazione...
                </motion.div>
              ) : (
                <>
                  <CheckCircle size={20} weight="fill" className="mr-2" />
                  Paga {euroFromCents(amount)}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Questo è un pagamento simulato per scopi dimostrativi. Nessun addebito reale verrà effettuato.
        </p>
      </DialogContent>
    </Dialog>
  )
}
