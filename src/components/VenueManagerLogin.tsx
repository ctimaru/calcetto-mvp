import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Buildings, EnvelopeSimple, LockKey, User, Phone } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import type { VenueManager } from '@/lib/types'

interface VenueManagerLoginProps {
  onLogin: (manager: VenueManager) => void
  onBack: () => void
}

export function VenueManagerLogin({ onLogin, onBack }: VenueManagerLoginProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [isLoading, setIsLoading] = useState(false)

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const managers = await window.spark.kv.get<VenueManager[]>('venue-managers') || []
      const passwords = await window.spark.kv.get<Record<string, string>>('venue-manager-passwords') || {}

      const manager = managers.find(m => m.email.toLowerCase() === loginForm.email.toLowerCase())

      if (!manager) {
        toast.error('Account non trovato')
        setIsLoading(false)
        return
      }

      const storedPassword = passwords[manager.id]
      if (storedPassword !== loginForm.password) {
        toast.error('Password non corretta')
        setIsLoading(false)
        return
      }

      toast.success(`Benvenuto, ${manager.firstName}!`)
      onLogin(manager)
    } catch (error) {
      toast.error('Errore durante il login')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Le password non corrispondono')
      return
    }

    if (signupForm.password.length < 6) {
      toast.error('La password deve essere di almeno 6 caratteri')
      return
    }

    setIsLoading(true)

    try {
      const managers = await window.spark.kv.get<VenueManager[]>('venue-managers') || []
      const passwords = await window.spark.kv.get<Record<string, string>>('venue-manager-passwords') || {}

      const existingManager = managers.find(m => m.email.toLowerCase() === signupForm.email.toLowerCase())
      if (existingManager) {
        toast.error('Email già registrata')
        setIsLoading(false)
        return
      }

      const newManager: VenueManager = {
        id: `manager-${Date.now()}`,
        email: signupForm.email,
        firstName: signupForm.firstName,
        lastName: signupForm.lastName,
        phone: signupForm.phone,
        venueIds: [],
        createdAt: new Date().toISOString()
      }

      await window.spark.kv.set('venue-managers', [...managers, newManager])
      await window.spark.kv.set('venue-manager-passwords', {
        ...passwords,
        [newManager.id]: signupForm.password
      })

      toast.success('Registrazione completata con successo!')
      onLogin(newManager)
    } catch (error) {
      toast.error('Errore durante la registrazione')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2"
          >
            <Buildings size={24} weight="duotone" />
            Torna alla Home
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Buildings size={32} weight="duotone" className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Gestione Venue</h1>
            <p className="text-muted-foreground">
              Accedi per gestire i tuoi campi e le prenotazioni
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Accedi</TabsTrigger>
              <TabsTrigger value="signup">Registrati</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Accedi al tuo account</CardTitle>
                  <CardDescription>
                    Inserisci le tue credenziali per accedere
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <EnvelopeSimple 
                          size={20} 
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                        />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="mario.rossi@esempio.it"
                          className="pl-10"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <LockKey 
                          size={20} 
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                        />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Accesso in corso...' : 'Accedi'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Crea un nuovo account</CardTitle>
                  <CardDescription>
                    Registrati per iniziare a gestire i tuoi venue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-firstName">Nome</Label>
                        <div className="relative">
                          <User 
                            size={20} 
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                          />
                          <Input
                            id="signup-firstName"
                            type="text"
                            placeholder="Mario"
                            className="pl-10"
                            value={signupForm.firstName}
                            onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-lastName">Cognome</Label>
                        <Input
                          id="signup-lastName"
                          type="text"
                          placeholder="Rossi"
                          value={signupForm.lastName}
                          onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <EnvelopeSimple 
                          size={20} 
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                        />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="mario.rossi@esempio.it"
                          className="pl-10"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Telefono</Label>
                      <div className="relative">
                        <Phone 
                          size={20} 
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                        />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="+39 123 456 7890"
                          className="pl-10"
                          value={signupForm.phone}
                          onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <LockKey 
                          size={20} 
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                        />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirmPassword">Conferma Password</Label>
                      <div className="relative">
                        <LockKey 
                          size={20} 
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                        />
                        <Input
                          id="signup-confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Registrazione in corso...' : 'Registrati'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
