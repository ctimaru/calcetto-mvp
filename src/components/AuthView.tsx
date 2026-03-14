import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Trophy, 
  CheckCircle, 
  Users, 
  MapPin, 
  CreditCard,
  Lightning,
  X
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { login, register } from '@/lib/api'

interface AuthViewProps {
  onAuthenticated: () => void
}

export function AuthView({ onAuthenticated }: AuthViewProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)

    try {
      await login(email, password)
      setSuccess('Login effettuato con successo!')
      setTimeout(() => {
        onAuthenticated()
      }, 500)
    } catch (err: any) {
      setError(err.message || 'Errore durante il login')
    } finally {
      setBusy(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)

    try {
      if (!email || !password) {
        setError('Compila tutti i campi obbligatori')
        return
      }

      if (password.length < 6) {
        setError('La password deve essere di almeno 6 caratteri')
        return
      }

      await register(email, password)
      setSuccess('Registrazione completata! Controlla la tua email per confermare.')
      setTimeout(() => {
        setEmail(email)
        setPassword('')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Errore durante la registrazione')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy size={32} weight="fill" className="text-primary" />
              <span className="text-2xl font-bold">App Calcetto</span>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setAuthMode('login')
                  setShowAuthModal(true)
                }}
              >
                Accedi
              </Button>
              <Button 
                onClick={() => {
                  setAuthMode('register')
                  setShowAuthModal(true)
                }}
                className="bg-primary hover:bg-primary/90"
              >
                Registrati
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <section className="relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 50%, oklch(0.45 0.12 155 / 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, oklch(0.82 0.18 130 / 0.15) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, oklch(0.62 0.14 45 / 0.1) 0%, transparent 50%)
              `
            }}
          />
          
          <div className="container mx-auto px-6 py-24 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Trova la tua partita perfetta
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed">
                Connettiti con giocatori nella tua città, prenota campi e organizza partite di calcetto in pochi click
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 h-auto"
                  onClick={() => {
                    setAuthMode('register')
                    setShowAuthModal(true)
                  }}
                >
                  Inizia ora
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 h-auto"
                  onClick={() => {
                    setAuthMode('login')
                    setShowAuthModal(true)
                  }}
                >
                  Scopri come funziona
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">Come funziona</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tre semplici passi per unirti alla community di giocatori
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: MapPin,
                  title: 'Trova partite vicine',
                  description: 'Cerca partite nella tua città con filtri per livello, orario e campo'
                },
                {
                  icon: Users,
                  title: 'Prenota il tuo posto',
                  description: 'Unisciti alle partite con un click e paga in modo sicuro online'
                },
                {
                  icon: Lightning,
                  title: 'Gioca e connettiti',
                  description: 'Chat con i partecipanti, organizza i dettagli e divertiti in campo'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all border-2 hover:border-primary/30">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <feature.icon size={32} weight="duotone" className="text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-2 border-primary/20">
                <CardContent className="p-12 text-center">
                  <Trophy size={64} weight="fill" className="text-primary mx-auto mb-6" />
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Pronto a giocare?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Unisciti a centinaia di giocatori che organizzano partite ogni settimana
                  </p>
                  <Button 
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-12 py-6 h-auto"
                    onClick={() => {
                      setAuthMode('register')
                      setShowAuthModal(true)
                    }}
                  >
                    Crea il tuo account gratuito
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <footer className="py-12 border-t border-border bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Trophy size={24} weight="fill" className="text-primary" />
                <span className="font-bold">App Calcetto</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2024 App Calcetto. Organizza partite, connetti giocatori.
              </p>
            </div>
          </div>
        </footer>
      </main>

      <AnimatePresence>
        {showAuthModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowAuthModal(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md pointer-events-auto"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">
                        {authMode === 'login' ? 'Accedi' : 'Registrati'}
                      </h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowAuthModal(false)}
                      >
                        <X size={24} />
                      </Button>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    {success && (
                      <Alert className="mb-4 bg-accent/10 border-accent/30">
                        <CheckCircle size={16} weight="fill" className="text-accent-foreground" />
                        <AlertDescription className="text-accent-foreground">{success}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu@esempio.com"
                          required
                          disabled={busy}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={6}
                          disabled={busy}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={busy}
                      >
                        {busy ? (authMode === 'login' ? 'Accesso...' : 'Creazione account...') : (authMode === 'login' ? 'Accedi' : 'Crea account')}
                      </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                      {authMode === 'login' ? (
                        <p className="text-muted-foreground">
                          Non hai un account?{' '}
                          <button
                            onClick={() => {
                              setAuthMode('register')
                              setError('')
                              setSuccess('')
                            }}
                            className="text-primary hover:underline font-medium"
                          >
                            Registrati ora
                          </button>
                        </p>
                      ) : (
                        <p className="text-muted-foreground">
                          Hai già un account?{' '}
                          <button
                            onClick={() => {
                              setAuthMode('login')
                              setError('')
                              setSuccess('')
                            }}
                            className="text-primary hover:underline font-medium"
                          >
                            Accedi
                          </button>
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
