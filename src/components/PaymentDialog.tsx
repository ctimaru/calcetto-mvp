import { useState } from 'react'
import { type Match, type User } from '@/lib/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CreditCard, Bank, X, CheckCircle, LockKey, ShieldCheck } from '@phosphor-icons/react'
import { formatDate, formatCurrency } from '@/lib/helpers'
import { motion } from 'framer-motion'

interface PaymentDialogProps {
  match: Match | null
  open: boolean
  onClose: () => void
  onConfirm: (paymentMethod: 'card' | 'paypal' | 'bank_transfer', cardLast4?: string) => void
  currentUser: User | null
}

export function PaymentDialog({ match, open, onClose, onConfirm, currentUser }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'bank_transfer'>('card')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCvc] = useState('')
  const [cardName, setCardName] = useState(currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!match || !currentUser) return null

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const chunks = cleaned.match(/.{1,4}/g)
    return chunks ? chunks.join(' ') : cleaned
  }

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
    }
    return cleaned
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '')
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(formatCardNumber(value))
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 4) {
      setCardExpiry(formatExpiry(value))
    }
  }

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= 3 && /^\d*$/.test(value)) {
      setCvc(value)
    }
  }

  const handleConfirm = async () => {
    setIsProcessing(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const cardLast4 = paymentMethod === 'card' && cardNumber.length > 0 
      ? cardNumber.replace(/\s/g, '').slice(-4) 
      : undefined
    
    onConfirm(paymentMethod, cardLast4)
    setIsProcessing(false)
    
    setCardNumber('')
    setCardExpiry('')
    setCvc('')
    setCardName(currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '')
  }

  const isFormValid = () => {
    if (paymentMethod === 'card') {
      return cardNumber.replace(/\s/g, '').length === 16 &&
             cardExpiry.length === 5 &&
             cardCvc.length === 3 &&
             cardName.trim().length > 0
    }
    return true
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CreditCard size={28} weight="duotone" className="text-primary" />
            Pagamento Sicuro
          </DialogTitle>
          <DialogDescription>
            Completa il pagamento per confermare la tua partecipazione alla partita
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Partita presso</p>
                <p className="font-semibold">{match.venue.name}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Data e Ora</span>
              <span className="font-medium">{formatDate(match.date)} • {match.time}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Totale da Pagare</span>
              <span className="font-bold text-primary">{formatCurrency(match.price)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Metodo di Pagamento</Label>
            <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
              <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/5 transition-colors cursor-pointer">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-2 flex-1 cursor-pointer">
                  <CreditCard size={24} weight="duotone" className="text-primary" />
                  <div>
                    <p className="font-medium">Carta di Credito/Debito</p>
                    <p className="text-xs text-muted-foreground">Visa, Mastercard, American Express</p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/5 transition-colors cursor-pointer">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal" className="flex items-center gap-2 flex-1 cursor-pointer">
                  <Bank size={24} weight="duotone" className="text-primary" />
                  <div>
                    <p className="font-medium">PayPal</p>
                    <p className="text-xs text-muted-foreground">Paga con il tuo account PayPal</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/5 transition-colors cursor-pointer">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                <Label htmlFor="bank_transfer" className="flex items-center gap-2 flex-1 cursor-pointer">
                  <Bank size={24} weight="duotone" className="text-primary" />
                  <div>
                    <p className="font-medium">Bonifico Bancario</p>
                    <p className="text-xs text-muted-foreground">Elaborazione entro 1-2 giorni</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {paymentMethod === 'card' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="card-number">Numero Carta</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Scadenza</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={cardCvc}
                    onChange={handleCvcChange}
                    maxLength={3}
                    type="password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-name">Nome sulla Carta</Label>
                <Input
                  id="card-name"
                  placeholder="Mario Rossi"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
            </motion.div>
          )}

          <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg flex items-start gap-3">
            <ShieldCheck size={24} weight="duotone" className="text-accent flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-accent-foreground">Pagamento Sicuro e Protetto</p>
              <p className="text-muted-foreground text-xs">
                I tuoi dati di pagamento sono criptati e protetti. Riceverai un rimborso automatico in caso di cancellazione della partita.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Annulla
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={!isFormValid() || isProcessing}
          >
            {isProcessing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="mr-2"
                >
                  <LockKey size={20} weight="bold" />
                </motion.div>
                Elaborazione...
              </>
            ) : (
              <>
                <CheckCircle size={20} weight="bold" className="mr-2" />
                Conferma e Paga {formatCurrency(match.price)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
