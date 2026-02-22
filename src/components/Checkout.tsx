import { useMemo, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'
import { stripePromise } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreditCard, XCircle, CheckCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

type CheckoutProps = {
  clientSecret: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function Checkout({ clientSecret, onSuccess, onCancel }: CheckoutProps) {
  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: 'flat',
        variables: {
          colorPrimary: 'oklch(0.45 0.12 155)',
          colorBackground: 'oklch(1 0 0)',
          colorText: 'oklch(0.18 0.02 240)',
          colorDanger: 'oklch(0.55 0.22 25)',
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '12px',
        },
      },
    }),
    [clientSecret]
  )

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard size={24} weight="duotone" className="text-primary" />
          Pagamento
        </CardTitle>
        <CardDescription>
          Completa il pagamento per confermare la tua partecipazione
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm onSuccess={onSuccess} onCancel={onCancel} />
        </Elements>
        <Alert className="mt-4 bg-muted/50 border-muted">
          <AlertDescription className="text-xs text-muted-foreground">
            La conferma definitiva arriva via webhook e può richiedere qualche secondo.
            Non ricaricare la pagina durante il processo.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

function CheckoutForm({ onSuccess, onCancel }: { onSuccess?: () => void; onCancel?: () => void }) {
  const stripe = useStripe()
  const elements = useElements()

  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (!stripe || !elements) return

    setBusy(true)
    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (result.error) {
        setErrorMsg(result.error.message ?? 'Pagamento non riuscito.')
        return
      }

      setIsSuccess(true)
      
      setTimeout(() => {
        onSuccess?.()
      }, 1500)
    } catch (err: any) {
      setErrorMsg(err?.message ?? String(err))
    } finally {
      setBusy(false)
    }
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-8 gap-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <CheckCircle size={64} weight="fill" className="text-primary" />
        </motion.div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Pagamento completato!</h3>
          <p className="text-sm text-muted-foreground">
            La tua partecipazione verrà confermata a breve.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="min-h-[200px]">
        <PaymentElement />
      </div>

      {errorMsg && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2">
          <XCircle size={18} weight="fill" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={!stripe || !elements || busy}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {busy ? (
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
              <CheckCircle size={20} weight="bold" className="mr-2" />
              Conferma pagamento
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          disabled={busy}
        >
          Annulla
        </Button>
      </div>
    </form>
  )
}
